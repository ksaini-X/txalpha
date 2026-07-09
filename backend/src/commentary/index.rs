use std::env;

use dotenv::dotenv;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct GroqRequest {
    model: String,
    instructions: String,
    input: String,
    max_output_tokens: u32,
}

#[derive(Deserialize)]
struct GroqResponse {
    output: Vec<GroqOutputItem>,
}

#[derive(Deserialize)]
struct GroqOutputItem {
    #[serde(rename = "type")]
    item_type: String,
    #[serde(default)]
    content: Vec<GroqContentItem>,
}

#[derive(Deserialize)]
struct GroqContentItem {
    #[serde(rename = "type")]
    content_type: String,
    #[serde(default)]
    text: Option<String>,
}

const COMMENTARY_INSTRUCTIONS: &str = "You are a terse football commentary generator for a live betting dashboard. \
    Given a match event, respond with exactly one short sentence (under 20 words) describing \
    what happened and its significance. No preamble, no reasoning, no markdown, just the sentence.";

/// Core reusable function — call this from anywhere (odds_stream, scores_stream, or an HTTP handler)
pub async fn generate_commentary(event_description: &str) -> Result<String, String> {
    dotenv().ok();
    let client = Client::new();
    let api_key = env::var("GROQ_API_KEY").expect("Failed to laod GROQ_API_KEY");
    let body = GroqRequest {
        model: "openai/gpt-oss-20b".to_string(),
        instructions: COMMENTARY_INSTRUCTIONS.to_string(),
        input: event_description.to_string(),
        max_output_tokens: 600,
    };

    let response = client
        .post("https://api.groq.com/openai/v1/responses")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Groq request failed: {e}"))?;

    let status = response.status();
    let raw_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {e}"))?;

    println!("Groq raw response: {raw_text}"); // ADD THIS LINE

    if status == reqwest::StatusCode::TOO_MANY_REQUESTS {
        return Err("Groq rate limit exceeded. Please try again shortly.".to_string());
    }

    let parsed: GroqResponse = serde_json::from_str(&raw_text)
        .map_err(|e| format!("Failed to parse Groq response: {e} — raw: {raw_text}"))?;

    parsed
        .output
        .iter()
        .find(|item| item.item_type == "message")
        .and_then(|item| {
            item.content
                .iter()
                .find(|c| c.content_type == "output_text")
        })
        .and_then(|c| c.text.clone())
        .ok_or_else(|| "Groq returned a success status but no output text.".to_string())
}
