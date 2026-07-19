use axum::extract::ws::Message;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::mpsc::Sender;

use crate::{
    AppConfig,
    commentary::index::generate_commentary,
    processor::get_fixture_scores_snapshot::{ScoreSequenceEvent, get_fixture_score_sequence},
};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreEvent {
    #[serde(rename = "FixtureId")]
    pub fixture_id: i64,
    #[serde(rename = "GameState")]
    pub game_state: Option<String>,
    #[serde(rename = "StartTime")]
    pub start_time: Option<i64>,
    #[serde(rename = "Clock")]
    pub clock: Option<Clock>,
    #[serde(rename = "Data")]
    pub data: Option<EventData>,
    #[serde(rename = "Stats")]
    pub stats: Option<HashMap<String, i64>>,
    #[serde(rename = "Participant")]
    pub participant: Option<i64>,
    #[serde(rename = "Ts")]
    pub ts: i64,
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

#[derive(Serialize, Debug, Deserialize)]
pub struct ScoresDataWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str,
    fixture_id: i64,
    data: ScoreEvent,
    ts: i64,
}

#[derive(Serialize, Debug, Deserialize)]
pub struct InitialScoresDataWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str,
    fixture_id: i64,
    data: Vec<ScoreSequenceEvent>,
}

#[derive(Serialize, Debug)]
pub struct CommentaryWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str,
    fixture_id: i64,
    text: String,
    ts: i64,
}

pub async fn scores_stream(client_tx: Sender<Message>, fixture_id: i64, config: AppConfig) {
    println!("Subscribed to Scores Stream");

    let initial_data = get_fixture_score_sequence(fixture_id, config.clone()).await;
    match initial_data {
        Ok(data) => match serde_json::to_string(&InitialScoresDataWebSocketEvent {
            event_type: "score_snapshot",
            data,
            fixture_id,
        }) {
            Ok(json) => {
                if client_tx.send(Message::Text(json.into())).await.is_err() {
                    println!("Client disconnected before initial snapshot could be sent");
                    return;
                }
            }
            Err(e) => eprintln!("Failed to serialize initial snapshot: {e}"),
        },
        Err(e) => println!("No initial score data for fixture {fixture_id}: {e}"),
    }

    let response = match config
        .client
        .get("https://txline.txodds.com/api/scores/stream")
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Failed to connect to TxLINE scores stream for fixture {fixture_id}: {e}");
            return;
        }
    };

    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(bytes) = stream.next().await {
        if let Ok(bytes) = bytes {
            let chunk = String::from_utf8_lossy(&bytes);
            buffer.push_str(&chunk);

            while let Some(pos) = buffer.find("\n\n") {
                let event = buffer[..pos].to_string();
                buffer = buffer[pos + 2..].to_string();

                for line in event.lines() {
                    if let Some(msg) = line.strip_prefix("data: ") {
                        if msg.trim_start().starts_with("{\"Ts\"") {
                            continue; // heartbeat, skip
                        }

                        match serde_json::from_str::<ScoreEvent>(msg) {
                            Ok(data) => {
                                if data.fixture_id != fixture_id {
                                    continue;
                                }

                                // 1. send raw update immediately
                                let ws_event = ScoresDataWebSocketEvent {
                                    event_type: "score_update",
                                    data: data.clone(),
                                    fixture_id,
                                    ts: chrono::Utc::now().timestamp(),
                                };
                                match serde_json::to_string(&ws_event) {
                                    Ok(json) => {
                                        if client_tx.send(Message::Text(json.into())).await.is_err()
                                        {
                                            return;
                                        }
                                    }
                                    Err(e) => eprintln!("Failed to serialize update: {e}"),
                                }

                                // 2. check significance (goal only, confirmed field)
                                if let Some(event_data) = &data.data {
                                    if event_data.goal {
                                        let minute = data
                                            .clock
                                            .as_ref()
                                            .map(|c| c.seconds / 60)
                                            .unwrap_or(0);
                                        let event_description = format!(
                                            "Fixture {}: Goal scored by participant {:?} at minute {}.",
                                            fixture_id, data.participant, minute
                                        );

                                        let client_tx_clone = client_tx.clone();
                                        let event_ts = data.ts;
                                        tokio::spawn(async move {
                                            match generate_commentary(&event_description).await {
                                                Ok(text) => {
                                                    let payload = CommentaryWebSocketEvent {
                                                        event_type: "commentary",
                                                        fixture_id,
                                                        text,
                                                        ts: event_ts,
                                                    };
                                                    if let Ok(json) =
                                                        serde_json::to_string(&payload)
                                                    {
                                                        let _ = client_tx_clone
                                                            .send(Message::Text(json.into()))
                                                            .await;
                                                    }
                                                }
                                                Err(e) => {
                                                    eprintln!("Commentary generation failed: {e}")
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                            Err(e) => {
                                eprintln!("Failed to parse score event: {e} — raw: {msg}");
                            }
                        }
                    }
                }
            }
        }
    }
}
