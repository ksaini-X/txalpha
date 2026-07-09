pub mod commentary;
pub mod processor;
pub mod snapshot;
pub mod types;
use dotenv::dotenv;
use futures_util::{SinkExt, StreamExt};
use std::env;

use axum::{
    Router,
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
    routing::{get, post},
};
use reqwest::Client;
use tokio::net::TcpListener;

use crate::{
    processor::{
        get_fixtures::get_fixtures, odds_stream::odds_stream, scores_stream::scores_stream,
    },
    types::incoming_msg::IncomingMessage,
};

#[derive(Clone)]
pub struct AppConfig {
    pub jwt: String,
    pub api_key: String,
    pub client: reqwest::Client,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let client = Client::new();
    let config = AppConfig {
        jwt: env::var("TXLINE_JWT").expect("TXLINE_JWT not set"),
        api_key: env::var("TXLINE_API_TOKEN").expect("TXLINE_API_TOKEN not set"),
        client,
    };

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
    let router = Router::new()
        .route("/health", get(health))
        .route("/ws", get(ws_handler))
        .with_state(config);
    axum::serve(listener, router).await.unwrap()
}
async fn health() -> String {
    "hello".to_string()
}
async fn ws_handler(ws: WebSocketUpgrade, State(config): State<AppConfig>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, config))
}

async fn handle_socket(socket: WebSocket, config: AppConfig) {
    println!("Connected {:?}", socket.protocol());
    let (mut sender_socket, mut receiver_socket) = socket.split();
    let (client_tx, mut client_rx) = tokio::sync::mpsc::channel::<Message>(100);

    tokio::spawn(async move {
        while let Some(msg) = client_rx.recv().await {
            if sender_socket.send(msg).await.is_err() {
                break;
            }
        }
    });
    tokio::spawn(async move {
        while let Some(msg) = receiver_socket.next().await {
            if let Ok(data) = msg {
                match data {
                    Message::Text(text) => match serde_json::from_str::<IncomingMessage>(&text) {
                        Err(e) => println!("Failed to parse message: {e} — raw text: {text}"),
                        Ok(parsed_text) => match parsed_text {
                            IncomingMessage::GetMatches => {
                                let config_clone = config.clone();

                                let matches = get_fixtures(config_clone).await;
                                match serde_json::to_string(&matches) {
                                    Ok(json) => {
                                        if client_tx.send(Message::Text(json.into())).await.is_err()
                                        {
                                            break;
                                        }
                                    }
                                    Err(e) => eprintln!("Failed to serialize matches: {e}"),
                                }
                            }
                            IncomingMessage::GetMatchUpdates { fixture_id } => {
                                println!("Subscribed to odds for {:?}", fixture_id);
                                let tx_clone = client_tx.clone();
                                let config_clone = config.clone();
                                tokio::spawn(async move {
                                    odds_stream(tx_clone, fixture_id, config_clone).await;
                                });
                            }
                            IncomingMessage::GetMatchScores { fixture_id } => {
                                println!("Subscribed to scores for {:?}", fixture_id);
                                let tx_clone = client_tx.clone();
                                let config_clone = config.clone();
                                tokio::spawn(async move {
                                    scores_stream(tx_clone, fixture_id, config_clone).await;
                                });
                            }
                            _ => {}
                        },
                    },
                    _ => {}
                }
            }
        }
    });
}
