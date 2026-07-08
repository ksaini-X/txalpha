use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct ModifiedFixture {
    pub id: String,
    pub home_team: String,
    pub away_team: String,
    pub kickoff: String,
    pub status: MatchStatus,
}

#[derive(Clone, Serialize, Deserialize, PartialEq)]
pub enum MatchStatus {
    Upcoming,
    Live,
    Finished,
}

#[derive(Clone, Serialize, Deserialize, Default)]
pub struct MatchState {
    pub home_score: u32,
    pub away_score: u32,
    pub home_prob: f64,
    pub away_prob: f64,
    pub possession_home: f64,
    pub events: Vec<MatchEvent>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchEvent {
    pub minute: u32,
    pub kind: String,
    pub description: String,
    pub commentary: Option<String>,
    pub prob_after: f64,
}

#[derive(Clone)]
pub struct AppState {}
