use serde::{Deserialize, Serialize};

use crate::{
    AppConfig,
    types::scores_stream::{Clock, DataSoccer, ScoreSoccer},
};

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct FixtureScoreSnapshot {
    pub fixture_id: i64,
    pub game_state: Option<String>,
    pub start_time: Option<i64>,
    pub ts: i64,
    pub clock: Option<Clock>,
    #[serde(rename = "scoreSoccer")]
    pub score_soccer: Option<ScoreSoccer>,
    #[serde(rename = "dataSoccer")]
    pub data_soccer: Option<DataSoccer>,
}
pub async fn get_fixture_score_snapshot(
    fixture_id: i64,
    config: AppConfig,
) -> Result<Vec<FixtureScoreSnapshot>, String> {
    let response = config
        .client
        .get(format!(
            "https://txline.txodds.com/api/scores/historical/{}",
            fixture_id
        ))
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = response.status();
    let raw_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read body: {e}"))?;

    if !status.is_success() {
        return Err(format!(
            "Scores historical API error ({status}): {raw_text}"
        ));
    }

    let snapshot: Vec<FixtureScoreSnapshot> = serde_json::from_str(&raw_text).map_err(|e| {
        format!(
            "Failed to parse: {e} — raw (first 500 chars): {}",
            &raw_text.chars().take(500).collect::<String>()
        )
    })?;

    println!(
        "Got {} score snapshot entries for fixture {fixture_id}",
        snapshot.len()
    );
    Ok(snapshot)
}
