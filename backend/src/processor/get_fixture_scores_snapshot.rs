use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::AppConfig;

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreSequenceEvent {
    #[serde(rename = "FixtureId")]
    pub fixture_id: i64,
    #[serde(rename = "GameState")]
    pub game_state: Option<String>,
    #[serde(rename = "StartTime")]
    pub start_time: Option<i64>,
    #[serde(rename = "Action")]
    pub action: Option<String>,
    #[serde(rename = "Ts")]
    pub ts: i64,
    #[serde(rename = "StatusId")]
    pub status_id: Option<i64>,
    #[serde(rename = "Clock")]
    pub clock: Option<Clock>,
    #[serde(rename = "Data")]
    pub data: Option<EventData>,
    #[serde(rename = "Score")]
    pub score: Option<SoccerScoreBreakdown>,
    #[serde(rename = "Stats")]
    pub stats: Option<HashMap<String, i64>>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Clock {
    #[serde(rename = "Running")]
    pub running: bool,
    #[serde(rename = "Seconds")]
    pub seconds: i64,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct EventData {
    #[serde(rename = "Corner")]
    pub corner: bool,
    #[serde(rename = "Goal")]
    pub goal: bool,
    #[serde(rename = "Penalty")]
    pub penalty: bool,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SoccerScoreBreakdown {
    #[serde(rename = "Participant1")]
    pub participant1: HalfBreakdown,
    #[serde(rename = "Participant2")]
    pub participant2: HalfBreakdown,
}

#[derive(Deserialize, Serialize, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct HalfBreakdown {
    #[serde(rename = "H1")]
    pub h1: Option<StatLine>,
    #[serde(rename = "HT")]
    pub ht: Option<StatLine>,
    #[serde(rename = "H2")]
    pub h2: Option<StatLine>,
    #[serde(rename = "Total")]
    pub total: Option<StatLine>,
}

#[derive(Deserialize, Serialize, Debug, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct StatLine {
    #[serde(rename = "Goals", default)]
    pub goals: i64,
    #[serde(rename = "YellowCards", default)]
    pub yellow_cards: i64,
    #[serde(rename = "RedCards", default)]
    pub red_cards: i64,
    #[serde(rename = "Corners", default)]
    pub corners: i64,
}

pub async fn get_fixture_score_sequence(
    fixture_id: i64,
    config: AppConfig,
) -> Result<Vec<ScoreSequenceEvent>, String> {
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

    let sequence: Vec<ScoreSequenceEvent> = serde_json::from_str(&raw_text).map_err(|e| {
        format!(
            "Failed to parse: {e} — raw (first 500 chars): {}",
            &raw_text.chars().take(500).collect::<String>()
        )
    })?;

    println!(
        "Got {} score sequence entries for fixture {fixture_id}",
        sequence.len()
    );
    Ok(sequence)
}
