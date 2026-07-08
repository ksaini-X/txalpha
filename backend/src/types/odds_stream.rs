use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(
    rename_all(deserialize = "PascalCase"),
    rename_all(serialize = "camelCase")
)]
pub struct OddsData {
    pub fixture_id: i64,

    pub ts: i64,

    pub super_odds_type: String,

    pub in_running: bool,

    pub market_parameters: Option<String>,

    pub market_period: Option<String>,

    pub game_state: Option<String>,

    pub price_names: Vec<String>,

    pub pct: Vec<String>,
}
