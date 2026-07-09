use axum::extract::ws::Message;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::Sender;

use crate::{
    AppConfig,
    commentary::index::generate_commentary,
    processor::get_fixture_odds_snapshot::{FixtureOddsSnapShot, get_fixture_odds_snapshot},
    types::odds_stream::OddsData,
};

#[derive(Serialize, Debug, Deserialize)]
pub struct OddsDataWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str,
    fixture_id: i64,
    data: OddsData,
}

#[derive(Serialize, Debug, Deserialize)]
pub struct InitialOddsDataWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str,
    fixture_id: i64,
    data: Vec<FixtureOddsSnapShot>,
}

#[derive(Serialize, Debug)]
pub struct CommentaryWebSocketEvent {
    #[serde(rename = "type")]
    event_type: &'static str, // "commentary"
    fixture_id: i64,
    text: String,
}

const SIGNIFICANT_PROB_SWING: f64 = 0.0; // percentage points

pub async fn odds_stream(client_tx: Sender<Message>, fixture_id: i64, config: AppConfig) {
    println!("Subscribed to Odds Stream");
    let initial_data = get_fixture_odds_snapshot(fixture_id, config.clone()).await;

    // track last known home-win probability, to detect swings
    let mut last_home_pct: Option<f64> = None;

    match initial_data {
        Ok(data) => {
            match serde_json::to_string(&InitialOddsDataWebSocketEvent {
                event_type: "snapshot",
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
            }
        }
        Err(_) => println!("No Initial Data"),
    }

    let response = match config
        .client
        .get("https://txline.txodds.com/api/odds/stream")
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Failed to connect to TxLINE odds stream for fixture {fixture_id}: {e}");
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
                        if let Ok(data) = serde_json::from_str::<OddsData>(msg) {
                            if data.fixture_id != fixture_id {
                                continue;
                            }
                            // only care about the main match-winner market for swing detection
                            if data.super_odds_type != "1X2_PARTICIPANT_RESULT" {
                                continue;
                            }

                            // 1. send raw update, as before
                            let ws_event = OddsDataWebSocketEvent {
                                event_type: "update",
                                data: data.clone(),
                                fixture_id,
                            };
                            match serde_json::to_string(&ws_event) {
                                Ok(json) => {
                                    if client_tx.send(Message::Text(json.into())).await.is_err() {
                                        return;
                                    }
                                }
                                Err(e) => eprintln!("Failed to serialize update: {e}"),
                            }

                            // 2. check for a significant swing
                            if let Some(home_pct_str) = data.pct.first() {
                                if let Ok(home_pct) = home_pct_str.parse::<f64>() {
                                    if let Some(prev) = last_home_pct {
                                        let delta = (home_pct - prev).abs();
                                        if delta >= SIGNIFICANT_PROB_SWING {
                                            println!(
                                                "SPAWNING commentary task for fixture {fixture_id}"
                                            );

                                            let event_description = format!(
                                                "Fixture {}: implied home win probability moved from {:.1}% to {:.1}% ({}{:.1} points).",
                                                fixture_id,
                                                prev,
                                                home_pct,
                                                if home_pct > prev { "+" } else { "-" },
                                                delta,
                                            );

                                            let client_tx_clone = client_tx.clone();
                                            tokio::spawn(async move {
                                                match generate_commentary(&event_description).await
                                                {
                                                    Ok(text) => {
                                                        let payload = CommentaryWebSocketEvent {
                                                            event_type: "commentary",
                                                            fixture_id,
                                                            text,
                                                        };
                                                        if let Ok(json) =
                                                            serde_json::to_string(&payload)
                                                        {
                                                            let _ = client_tx_clone
                                                                .send(Message::Text(json.into()))
                                                                .await;
                                                        }
                                                    }
                                                    Err(e) => eprintln!(
                                                        "Commentary generation failed: {e}"
                                                    ),
                                                }
                                            });
                                        }
                                    }
                                    last_home_pct = Some(home_pct);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
