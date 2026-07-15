use axum::extract::ws::Message;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::Sender;

use crate::{
    AppConfig,
    commentary::index::generate_commentary, // adjust path to match your actual module
    processor::get_fixture_scores_snapshot::{FixtureScoreSnapshot, get_fixture_score_snapshot},
    types::scores_stream::ScoreEvent,
};

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
    data: Vec<FixtureScoreSnapshot>,
}

#[derive(Serialize, Debug)]
pub struct CommentaryWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str, // "commentary"
    fixture_id: i64,
    text: String,
}

pub async fn scores_stream(client_tx: Sender<Message>, fixture_id: i64, config: AppConfig) {
    println!("Subscribed to Scores Stream");

    let initial_data = get_fixture_score_snapshot(fixture_id, config.clone()).await;
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

                        if let Ok(data) = serde_json::from_str::<ScoreEvent>(msg) {
                            if data.data.fixture_id != fixture_id {
                                continue;
                            }

                            // 1. Send the raw update immediately, as before
                            let ws_event = ScoresDataWebSocketEvent {
                                event_type: "score_update",
                                data: data.clone(), // clone since we need `data` again below
                                fixture_id,
                                ts: chrono::Utc::now().timestamp(),
                            };
                            match serde_json::to_string(&ws_event) {
                                Ok(json) => {
                                    if client_tx.send(Message::Text(json.into())).await.is_err() {
                                        return;
                                    }
                                }
                                Err(e) => eprintln!("Failed to serialize update: {e}"),
                            }

                            // 2. Check if this event is significant enough for commentary
                            if let Some(data_soccer) = &data.data.data_soccer {
                                let is_significant = data_soccer.goal == Some(true)
                                    || data_soccer.red_card == Some(true)
                                    || data_soccer.yellow_card == Some(true);

                                if is_significant {
                                    let event_description = format!(
                                        "Fixture {}: {} at minute {:?}. Goal: {:?}, Yellow card: {:?}, Red card: {:?}",
                                        fixture_id,
                                        data.event,
                                        data_soccer.minutes,
                                        data_soccer.goal,
                                        data_soccer.yellow_card,
                                        data_soccer.red_card,
                                    );

                                    let client_tx_clone = client_tx.clone();
                                    tokio::spawn(async move {
                                        match generate_commentary(&event_description).await {
                                            Ok(text) => {
                                                let payload = CommentaryWebSocketEvent {
                                                    event_type: "commentary",
                                                    fixture_id,
                                                    text,
                                                };
                                                if let Ok(json) = serde_json::to_string(&payload) {
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
                    }
                }
            }
        }
    }
}
