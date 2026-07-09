use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreEvent {
    pub event: String,
    pub data: ScoreEventData,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreEventData {
    pub fixture_id: i64,
    pub game_state: Option<String>,
    pub clock: Option<Clock>,
    pub score_soccer: Option<ScoreSoccer>,
    pub data_soccer: Option<DataSoccer>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Clock {
    pub running: bool,
    pub seconds: i64,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreSoccer {
    #[serde(rename = "Participant1")]
    pub participant1: SoccerTotals,
    #[serde(rename = "Participant2")]
    pub participant2: SoccerTotals,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SoccerTotals {
    #[serde(rename = "Total")]
    pub total: SoccerStatLine,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SoccerStatLine {
    #[serde(rename = "Goals")]
    pub goals: i64,
    #[serde(rename = "YellowCards")]
    pub yellow_cards: i64,
    #[serde(rename = "RedCards")]
    pub red_cards: i64,
    #[serde(rename = "Corners")]
    pub corners: i64,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct DataSoccer {
    #[serde(default)]
    pub goal: Option<bool>,
    #[serde(default)]
    pub corner: Option<bool>,
    #[serde(default)]
    #[serde(rename = "YellowCard")]
    pub yellow_card: Option<bool>,
    #[serde(default)]
    #[serde(rename = "RedCard")]
    pub red_card: Option<bool>,
    #[serde(rename = "Minutes")]
    pub minutes: Option<i64>,
    #[serde(rename = "Participant")]
    pub participant: Option<i64>,
}
