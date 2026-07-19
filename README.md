# TxAlpha

**Real-time World Cup market intelligence, built on TxLINE.**

Submitted to: *Prediction Markets and Settlement* track — TxODDS World Cup Hackathon

---

## 1. What it is

TxAlpha is a live dashboard that turns TxLINE's raw odds and score feeds into something a soccer fan or analytical user can actually read: a live implied-probability chart per match, AI-generated commentary explaining significant moments, a market-justification signal (did the odds move make sense given what happened on the pitch?), and cryptographically verifiable match settlement — all sourced directly from TxLINE, with no other data provider involved.

It's built like a newspaper: a front page, a "Match Desk" listing today's fixtures, and a per-match page that reads like a live report — score, probability movement, commentary, and a verified result once the match ends.

## 2. The problem it solves

Raw odds feeds tell you *that* something moved — `1.8 → 1.3`. They don't tell you *why*, or whether the move was proportionate to what actually happened in the match. TxAlpha adds that missing layer: it correlates odds movement against real match events (goals, cards) and flags whether a probability swing was **justified** by the action on the pitch or looks like an **overreaction**. It then explains that judgment in plain language via AI-generated commentary, generated only when something is actually significant — not on every tick.

## 3. Architecture

```
                        TxLINE (SSE + REST)
                 ┌───────────┬────────────┬──────────────┐
                 │           │            │              │
            odds/stream  scores/stream  fixtures    validation/
                 │           │            │        historical
                 │           │            │              │
                 ▼           ▼            ▼              ▼
        ┌──────────────────────────────────────────────────────┐
        │                Axum backend (Rust)                     │
        │  - AppConfig: shared reqwest client + credentials       │
        │  - Per-client WebSocket connection                       │
        │    (split into sender/receiver, mpsc mailbox pattern)     │
        │  - Per-subscription spawned tasks:                         │
        │      odds_stream(fixture_id)   — filtered, live, typed      │
        │      scores_stream(fixture_id) — filtered, live, typed       │
        │  - Market-justification + significant-event detection         │
        │    trigger async commentary generation (Groq)                 │
        │  - REST handler for Merkle-proof validation lookups             │
        └──────────────────────────────────────────────────────┘
                                   │
                          WebSocket (wss://)
                                   │
                        ┌───────────────────┐
                        │  Next.js frontend   │
                        │  - Front page         │
                        │  - Match Desk (list)    │
                        │  - Match detail page:     │
                        │    live probability chart, │
                        │    commentary feed,          │
                        │    market status badge,       │
                        │    verified settlement panel    │
                        └───────────────────┘
```

### Why WebSocket, not polling

TxLINE's SSE streams are server-side-only (auth headers, and the transform logic — odds→probability, event significance detection — needs to happen before data reaches the browser). The backend consumes TxLINE's SSE streams and re-publishes a filtered, typed, per-fixture feed to the browser over a single WebSocket connection. Every connected client gets its own mailbox (`tokio::mpsc`); the WebSocket's send-half is owned by exactly one task per client, so multiple concurrent producers (odds relay, scores relay, commentary generation) can all deliver messages to that client without contending for the socket directly.

### Why per-fixture task spawning, not one global consumer

Each client's subscription to a fixture (`GetMatchUpdates` / `GetMatchScores`) spawns a dedicated task that opens its own filtered connection to TxLINE's stream for that session. This keeps the architecture simple and correctness-first for the hackathon's scale; a documented production evolution (see §8) would deduplicate upstream connections per fixture via a shared broadcast channel.

## 4. TxLINE endpoints used

| Endpoint | Purpose in TxAlpha |
|---|---|
| `GET /api/fixtures/snapshot` | Populates the Match Desk — full World Cup schedule |
| `GET /api/odds/snapshot/{fixtureId}` | Seeds the probability chart on page load |
| `GET /api/odds/stream` (SSE) | Live odds ticks, filtered server-side to `1X2_PARTICIPANT_RESULT` and the subscribed `fixtureId` |
| `GET /api/scores/historical/{fixtureId}` | Full event sequence for a fixture — used both as the "recent history" snapshot on subscribe and as the data source for match statistics (goals/cards/corners by half) |
| `GET /api/scores/stream` (SSE) | Live match events, filtered server-side to the subscribed `fixtureId` |
| `GET /api/fixtures/validation?fixtureId=...` | Merkle proof lookup — powers the Verified Settlement panel |

## 5. Core logic (deterministic, no black box)

### 5.1 Implied probability

TxLINE's `pct` field on `1X2_PARTICIPANT_RESULT` odds entries already returns normalized implied probability per outcome (`[home%, draw%, away%]`) — no additional vig-removal math needed on our side. TxAlpha plots `home%` and `away%` over time, using the update's real timestamp on the x-axis (not synthetic "minutes"), so pre-match and in-play data both render correctly.

### 5.2 Market justification

On every live odds update for the primary match-winner market, TxAlpha compares the new home-win probability against the previous value:

```
delta = |new_home_pct − previous_home_pct|
```

If `delta` exceeds a fixed threshold (currently 5 percentage points), the move is flagged for commentary. The status badge (`JUSTIFIED` / `OVERREACTION`) reflects whether recent movement has been gradual (consistent with match state) or sharp (a jump that may not yet be reflected in the visible match action). This threshold is a simple, transparent heuristic — deliberately not a black-box model — chosen so that judges (and future contributors) can read and verify the exact rule in one line of code.

### 5.3 Significant-event detection (scores)

A score-stream event triggers commentary generation only when it carries a genuine goal flag (`Data.Goal == true`), avoiding noise from non-scoring events (game-state pings, disconnect/reconnect signals) that make up the majority of the raw stream.

### 5.4 AI commentary

Significant events (large odds swings, goals) are described in a short, structured prompt sent to Groq's `openai/gpt-oss-20b` model with a fixed system instruction: respond in one short, factual sentence, no reasoning shown, no markdown. Commentary generation is spawned as an independent async task per event, so a slow model response never blocks the live data pipeline — the raw event is always delivered to the client immediately; commentary follows a moment later as a separate message.

### 5.5 Verified settlement

TxLINE anchors odds/score updates with a Merkle proof, verifiable independently of TxAlpha's own backend. The Settlement panel fetches this proof on demand (`/api/fixtures/validation`) and renders the root hash and full sibling-hash proof chain, so a user isn't asked to trust TxAlpha's word for a match outcome — they can see the cryptographic receipt TxLINE itself provides.

## 6. Data-shape reality check

TxLINE's public API reference documents a single, maximal, multi-sport JSON schema shared across soccer, basketball, and American football event types. In practice, live soccer payloads only populate a small, differently-shaped subset of that schema — for example, individual score-stream events use a flat `{FixtureId, Clock, Data: {Goal, Corner, Penalty}, Stats}` shape with no `scoreSoccer`/`dataSoccer` wrapper, while checkpoint events (half-time, full-time) additionally carry a `Score` object with a proper `H1/HT/H2/Total` breakdown per team. TxAlpha's parsing was built and iteratively corrected against real captured traffic rather than the documentation's generic schema, and structs are intentionally scoped to only the fields actually observed in live soccer data.

## 7. Known limitations (stated plainly, not hidden)

- **Live cumulative score** is derived by incrementing a local counter each time a goal event is observed, since the live stream's individual events don't carry a running total (only checkpoint events like half-time/full-time do). A dropped and reconnected WebSocket mid-match could under-count until the next checkpoint event arrives.
- **Card events** (yellow/red) were not confirmed present in the live event stream's flat `Data` object during development; only goals are currently used as significant-event triggers. The full-sequence endpoint's checkpoint events do carry `YellowCards`/`RedCards` totals per half, which are used for the Match Statistics panel.
- **Participant-to-team mapping** (`Participant: 1` → home team) is inferred from `Participant1IsHome` on the fixture record and was validated against live match data during testing.

## 8. What we'd build next (production roadmap)

- **Shared upstream per fixture**: replace per-client TxLINE connections with a single shared connection per fixture, fanned out via broadcast channel to all subscribed clients — reduces redundant upstream load at scale.
- **Multi-match overview**: surface live probability movement across all active fixtures on the Match Desk, not just within a single match page.
- **Full odds history for replay**: extend replay mode (built for post-match viewing, per the hackathon's own note that live matches may have ended by review time) to include historical odds alongside the already-available full score-event sequence.

## 9. Feedback on the TxLINE API

**What worked well:** the odds `pct` field returning pre-computed, de-vigged implied probability meant zero guesswork on probability math. The Merkle-proof validation endpoint is a genuinely well-designed primitive — clean, self-contained, easy to build a trust-minimized UI around.

**Where we hit friction:**
- The public API reference schema for scores is a generic, maximal, multi-sport template that doesn't reflect the actual shape of live soccer payloads — we had to reverse-engineer the real structure from captured live traffic rather than the documented schema, which cost real development time.
- `/api/odds/stream` and `/api/scores/stream` are both unfiltered firehoses across all fixtures; there's no server-side per-fixture SSE option, so every subscribing client's connection receives (and must discard) data for every other in-progress match.
- Live score-stream events don't carry a cumulative running score — only periodic checkpoint events do — which required client-side score reconstruction rather than simply trusting a `Total` field on every tick.

## 10. Tech stack

- **Backend:** Rust, Axum, Tokio, reqwest, serde
- **Frontend:** Next.js, TypeScript, Recharts
- **AI:** Groq (`openai/gpt-oss-20b`) for live commentary generation
- **Deployment:** Render (backend), Vercel (frontend)

---

*Built for the TxODDS World Cup Hackathon, July 2026.*
