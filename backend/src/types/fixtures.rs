use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(
    rename_all(deserialize = "PascalCase"),
    rename_all(serialize = "camelCase")
)]
pub struct Fixture {
    pub ts: i64,
    pub start_time: i64,
    pub competition: String,
    pub competition_id: i64,
    pub fixture_group_id: i64,
    pub participant1_id: i64,
    pub participant1: String,
    pub participant2_id: i64,
    pub participant2: String,
    pub fixture_id: i64,
    pub participant1_is_home: bool,
}
