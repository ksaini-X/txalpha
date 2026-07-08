use axum::extract::ws::Message;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::Sender;

use crate::{
    AppConfig,
    processor::get_fixture_odds_snapshot::{FixtureSnapShot, get_fixture_odds_snapshot},
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
    data: Vec<FixtureSnapShot>,
}

pub async fn odds_stream(client_tx: Sender<Message>, fixture_id: i64, config: AppConfig) {
    let initial_data = get_fixture_odds_snapshot(fixture_id, config.clone()).await;
    match initial_data {
        Ok(data) => {
            match serde_json::to_string(&InitialOddsDataWebSocketEvent {
                event_type: "snapshot",
                data,
                fixture_id,
            }) {
                Ok(json) => {
                    println!("sent from odds steeam");

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

    let response = config
        .client
        .get("https://txline.txodds.com/api/odds/stream")
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
        .expect("Request failed");

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
                            if data.fixture_id == fixture_id {
                                let event = OddsDataWebSocketEvent {
                                    event_type: "update",
                                    data,
                                    fixture_id,
                                };
                                match serde_json::to_string(&event) {
                                    Ok(json) => {
                                        if client_tx.send(Message::Text(json.into())).await.is_err()
                                        {
                                            return; // client gone, stop streaming
                                        }
                                    }
                                    Err(e) => eprintln!("Failed to serialize update: {e}"),
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
