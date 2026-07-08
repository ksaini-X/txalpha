use dotenv::dotenv;

use crate::{AppConfig, types::fixtures::Fixture};

pub async fn get_fixtures(config: AppConfig) -> Vec<Fixture> {
    dotenv().ok();
    let fixtures: Vec<Fixture> = config
        .client
        .get("https://txline.txodds.com/api/fixtures/snapshot")
        .header("Authorization", format!("Bearer {}", config.jwt))
        .header("X-Api-Token", config.api_key)
        .send()
        .await
        .expect("Request failed")
        .json()
        .await
        .expect("Failed to parse JSON");

    fixtures
}
