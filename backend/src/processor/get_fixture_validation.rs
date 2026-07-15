use crate::AppConfig;
use axum::{
    Json,
    extract::{Query, State},
    response::IntoResponse,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct FixtureSnapshotInfo {
    pub ts: i64,
    pub start_time: i64,
    pub competition: String,
    pub competition_id: i64,
    pub fixture_group_id: i64,
    pub participant1_id: i64,
    pub participant1: String,
    pub participant2_id: i64,
    pub participant2: String,
    pub fixture_id: i64,
    pub participant1_is_home: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStats {
    pub update_count: i64,
    pub min_timestamp: i64,
    pub max_timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationSummary {
    pub fixture_id: i64,
    pub competition_id: i64,
    pub competition: String,
    pub update_sub_tree_root: Vec<u8>,

    pub update_stats: UpdateStats,
    // NOTE:
    // The docs show this as a string. If the API actually returns
    // a byte array, change this back to Vec<u8>.
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofNode {
    pub hash: Vec<u8>,

    #[serde(rename = "isRightSibling")]
    pub is_right_sibling: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixtureValidation {
    pub snapshot: FixtureSnapshotInfo,

    pub summary: ValidationSummary,

    #[serde(rename = "subTreeProof")]
    pub sub_tree_proof: Vec<ProofNode>,

    #[serde(rename = "mainTreeProof")]
    pub main_tree_proof: Vec<ProofNode>,
}

pub async fn get_fixture_validation(
    fixture_id: i64,
    timestamp: Option<i64>,
    config: AppConfig,
) -> Result<FixtureValidation, String> {
    let mut url = format!(
        "https://txline.txodds.com/api/fixtures/validation?fixtureId={}",
        fixture_id
    );

    if let Some(ts) = timestamp {
        url.push_str(&format!("&timestamp={}", ts));
    }

    let response = config
        .client
        .get(url)
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = response.status();

    if !status.is_success() {
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "Unable to read response body".into());

        return Err(format!("Validation API error ({status}): {body}"));
    }

    response
        .json::<FixtureValidation>()
        .await
        .map_err(|e| format!("Failed to deserialize validation response: {e}"))
}

#[derive(Debug, Deserialize)]
pub struct ValidationQuery {
    pub fixture_id: i64,
    pub timestamp: Option<i64>,
}

pub async fn get_validation_handler(
    Query(params): Query<ValidationQuery>,
    State(config): State<AppConfig>,
) -> impl IntoResponse {
    match get_fixture_validation(params.fixture_id, params.timestamp, config).await {
        Ok(validation) => (StatusCode::OK, Json(validation)).into_response(),

        Err(err) => (StatusCode::BAD_GATEWAY, err).into_response(),
    }
}
