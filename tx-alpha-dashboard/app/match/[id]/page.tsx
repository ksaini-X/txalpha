"use client";

import Link from "next/link";
import { ProbabilityChart } from "@/components/ProbabilityChart";
import { ArrowLeft, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Fixture } from "@/app/types";

export interface ProbabilityPoint {
  ts: number;
  minute: number;
  home: number;
  away: number;
}
interface MatchEvent {
  minute: number;
  ts: number;
  type: "goal" | "corner" | "yellow_card" | "red_card";
  participant: number; // team ID — map to home/away via fixture.participant1Id/2Id
}
interface OddsUpdate {
  fixture_id: number;
  data: {
    fixture_id: number;
    ts: number;
    super_odds_type: string;
    market_period: string | null;
    price_names: string[];
    pct: string[];
  };
}

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const { socket } = useSocket();
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [liveScore, setLiveScore] = useState<{
    home: number;
    away: number;
  } | null>(null);
  const [liveMinute, setLiveMinute] = useState<number | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);

  const [probabilityHistory, setProbabilityHistory] = useState<
    ProbabilityPoint[]
  >([]);
  const [marketStatus, setMarketStatus] = useState<
    "JUSTIFIED" | "OVERREACTION" | null
  >(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleOpen = () => {
      socket.send(JSON.stringify({ type: "GetMatches" }));
      socket.send(
        JSON.stringify({ type: "GetMatchUpdates", fixture_id: Number(id) }),
      );
      socket.send(
        JSON.stringify({ type: "GetMatchScores", fixture_id: Number(id) }),
      );
    };

    const handleMessage = (event: MessageEvent) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      console.log(msg);

      // fixtures list response
      if (Array.isArray(msg)) {
        const found = msg.find((f: Fixture) => f.fixtureId === Number(id));
        if (found) setFixture(found);
        return;
      }

      // initial snapshot — data is an ARRAY of FixtureSnapShot
      if (msg.type === "snapshot" || Array.isArray(msg.data)) {
        setHasInitialData(true);

        const relevant = (msg.data as any[]).filter(
          (d) => d.superOddsType === "1X2_PARTICIPANT_RESULT",
          // NOTE: not filtering on marketPeriod === null anymore —
          // real data seen so far only has "half=1", nothing with null.
          // revisit once we confirm what a full-match line looks like.
        );

        const points: ProbabilityPoint[] = relevant
          .map((d) => {
            const [homePct, , awayPct] = d.pct;
            if (homePct === "NA" || awayPct === "NA") return null;
            return {
              ts: d.ts,
              minute: 0,
              home: parseFloat(homePct),
              away: parseFloat(awayPct),
            };
          })
          .filter((p): p is ProbabilityPoint => p !== null)
          .sort((a, b) => a.ts - b.ts); // ensure chronological order

        if (points.length > 0) {
          setProbabilityHistory(points);
        }
        return;
      }

      // live odds update — data is a SINGLE OddsData object
      if (msg.type === "update" || (!Array.isArray(msg.data) && msg.data)) {
        const data = msg.data;
        if (data?.superOddsType !== "1X2_PARTICIPANT_RESULT") return;

        const [homePct, , awayPct] = data.pct;
        if (homePct === "NA" || awayPct === "NA") return;

        const kickoff = fixture?.startTime ?? data.ts;
        const minute = Math.max(0, Math.floor((data.ts - kickoff) / 60000));

        const newPoint: ProbabilityPoint = {
          minute,
          ts: data.ts,
          home: parseFloat(homePct),
          away: parseFloat(awayPct),
        };

        setProbabilityHistory((prev) => {
          const updated = [...prev, newPoint];
          if (updated.length >= 2) {
            const delta = Math.abs(
              newPoint.home - updated[updated.length - 2].home,
            );
            setMarketStatus(delta > 15 ? "OVERREACTION" : "JUSTIFIED");
          }
          return updated;
        });
      }

      // scores snapshot (initial)
      if (msg.type === "score_snapshot") {
        const latest = msg.data[msg.data.length - 1]; // or however you pick "current" from the snapshot array
        if (latest?.scoreSoccer) {
          setLiveScore({
            home: latest.scoreSoccer.Participant1.Total.Goals,
            away: latest.scoreSoccer.Participant2.Total.Goals,
          });
        }
        if (latest?.clock) {
          setLiveMinute(Math.floor(latest.clock.seconds / 60));
        }
        return;
      }

      // live score update
      if (msg.type === "score_update") {
        const data = msg.data.data; // ScoreEvent.data
        if (data.scoreSoccer) {
          setLiveScore({
            home: data.scoreSoccer.Participant1.Total.Goals,
            away: data.scoreSoccer.Participant2.Total.Goals,
          });
        }
        if (data.clock) {
          setLiveMinute(Math.floor(data.clock.seconds / 60));
        }

        // if this event is a notable match event, add to feed
        if (
          data.dataSoccer?.goal ||
          data.dataSoccer?.corner ||
          data.dataSoccer?.yellowCard ||
          data.dataSoccer?.redCard
        ) {
          const eventType = data.dataSoccer.goal
            ? "goal"
            : data.dataSoccer.redCard
              ? "red_card"
              : data.dataSoccer.yellowCard
                ? "yellow_card"
                : "corner";

          setMatchEvents((prev) => [
            {
              minute: data.dataSoccer.minutes ?? liveMinute ?? 0,
              ts: data.ts,
              type: eventType,
              participant: data.dataSoccer.participant ?? 0,
            },
            ...prev, // newest first
          ]);
        }
        return;
      }
    };
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    if (socket.readyState === WebSocket.OPEN) handleOpen();

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, id, fixture?.startTime]);

  if (!fixture) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading match…</p>
      </main>
    );
  }

  const homeTeam = fixture.participant1IsHome
    ? fixture.participant1
    : fixture.participant2;
  const awayTeam = fixture.participant1IsHome
    ? fixture.participant2
    : fixture.participant1;

  const kickoffDate = new Date(fixture.startTime);
  const now = Date.now();
  const hasStarted = now >= fixture.startTime;
  const kickoffLabel = kickoffDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
        linear-gradient(rgba(0,255,255,.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,.08) 1px, transparent 1px)
      `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute left-1/2 top-0 h-150 w-150 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            {/* Top Row */}
            <div className="mb-5 flex items-center justify-between">
              <Link
                href="/matches"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  liveScore
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${liveScore ? "bg-red-500 animate-pulse" : "bg-cyan-400"}`}
                />
                {liveScore ? `LIVE ${liveMinute ?? ""}'` : "UPCOMING"}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <h1 className="truncate text-2xl font-bold lg:text-3xl">
                    {homeTeam}
                  </h1>
                  {liveScore && (
                    <span className="text-3xl font-mono font-bold text-cyan-400">
                      {liveScore.home} -
                    </span>
                  )}

                  <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold tracking-[0.3em] text-slate-500">
                    VS
                  </span>
                  {liveScore && (
                    <span className="text-3xl font-mono font-bold text-cyan-400">
                      - {liveScore.away}
                    </span>
                  )}
                  <h1 className="truncate text-2xl font-bold lg:text-3xl">
                    {awayTeam}
                  </h1>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span>{fixture.competition}</span>

                  <span className="text-slate-600">•</span>

                  <span>{kickoffLabel}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">
                    Samples
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {probabilityHistory.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Kickoff
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />

                <span className="font-medium text-slate-200">
                  {kickoffLabel}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Competition
              </p>

              <p className="mt-3 font-medium text-slate-200">
                {fixture.competition}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Status
              </p>

              <p
                className={`mt-3 font-semibold ${
                  hasStarted ? "text-red-400" : "text-cyan-400"
                }`}
              >
                {hasStarted ? "LIVE" : "UPCOMING"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Chart */}
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Probability Movement</h2>

                    <p className="text-sm text-slate-400">
                      Live implied probability from market odds
                    </p>
                  </div>
                </div>

                {probabilityHistory.length === 0 ? (
                  <div className="flex h-[450px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />

                      <p className="text-slate-300">
                        {hasInitialData
                          ? "Waiting for live odds..."
                          : "Connecting to market feed..."}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Probability data will appear automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProbabilityChart
                    data={probabilityHistory}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                  />
                )}
              </div>

              {marketStatus && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />

                    <h3 className="text-lg font-semibold">Market Activity</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Status
                      </p>

                      <p
                        className={`mt-2 font-bold ${
                          marketStatus === "JUSTIFIED"
                            ? "text-green-400"
                            : "text-amber-400"
                        }`}
                      >
                        {marketStatus}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Samples
                      </p>

                      <p className="mt-2 font-bold text-slate-200">
                        {probabilityHistory.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Last Update
                      </p>

                      <p className="mt-2 font-bold text-slate-200">
                        {new Date(
                          probabilityHistory.at(-1)?.ts ?? fixture.startTime,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* AI Commentary */}
            <div className="space-y-5">
              {matchEvents.length === 0 ? (
                <p className="text-sm text-slate-500">No match events yet.</p>
              ) : (
                matchEvents.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-cyan-400">
                        {e.minute}'
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] ${
                          e.type === "goal"
                            ? "bg-green-500/10 text-green-400"
                            : e.type === "red_card"
                              ? "bg-red-500/10 text-red-400"
                              : e.type === "yellow_card"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {e.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">
                      {/* TODO: replace with real Gemini-generated commentary once wired */}
                      {e.type === "goal" &&
                        `Goal for ${e.participant === fixture.participant1Id ? homeTeam : awayTeam}!`}
                      {e.type === "yellow_card" && `Yellow card shown.`}
                      {e.type === "red_card" && `Red card! Down to 10 men.`}
                      {e.type === "corner" && `Corner kick.`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
