use crate::{AppConfig, types::fixtures::Fixture};

pub async fn get_fixtures(config: AppConfig) -> Vec<Fixture> {
    let response = config
        .client
        .get("https://txline.txodds.com/api/fixtures/snapshot")
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await;

    let fixtures: Vec<Fixture> = match response {
        Ok(r) => r.json().await.unwrap_or_default(),
        Err(e) => {
            eprintln!("Failed to fetch fixtures: {e}");
            Vec::new()
        }
    };

    fixtures
}
