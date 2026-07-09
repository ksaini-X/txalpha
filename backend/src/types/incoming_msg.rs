use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum IncomingMessage {
    GetMatches,
    GetMatchUpdates { fixture_id: i64 },
    GetMatchScores { fixture_id: i64 },
}
