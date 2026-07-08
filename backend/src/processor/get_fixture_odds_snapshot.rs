use serde::{Deserialize, Serialize};

use crate::AppConfig;

#[derive(Deserialize, Serialize, Debug)]
#[serde(
    rename_all(deserialize = "PascalCase"),
    rename_all(serialize = "camelCase")
)]
pub struct FixtureOddsSnapShot {
    fixture_id: i64,
    message_id: String,
    ts: i64,
    bookmaker: String,
    bookmaker_id: i64,
    super_odds_type: String,
    in_running: bool,
    game_state: Option<String>,
    market_parameters: Option<String>,
    market_period: Option<String>,
    price_names: Vec<String>,
    prices: Vec<i64>,
    pct: Vec<String>,
}

pub async fn get_fixture_odds_snapshot(
    fixture_id: i64,
    config: AppConfig,
) -> Result<Vec<FixtureOddsSnapShot>, String> {
    let response = config
        .client
        .get(format!(
            "https://txline.txodds.com/api/odds/snapshot/{}",
            fixture_id
        ))
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let snapshot: Vec<FixtureOddsSnapShot> = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {e}"))?;

    println!(
        "Got {} snapshot entries for fixture {fixture_id}",
        snapshot.len()
    );

    Ok(snapshot)
}
