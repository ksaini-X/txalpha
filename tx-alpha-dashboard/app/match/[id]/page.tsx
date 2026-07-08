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
    <main className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-sans">Back to matches</span>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-slate-400">Home</p>
                <p className="text-lg font-bold text-slate-100">{homeTeam}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs font-mono text-slate-500 mb-1">
                {fixture.competition}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-sm">{kickoffLabel}</span>
              </div>
              {!hasStarted && (
                <span className="font-mono text-xs text-slate-500 mt-1 inline-block">
                  UPCOMING
                </span>
              )}
              {hasStarted && (
                <span className="font-mono text-xs text-slate-500 mt-1 inline-block">
                  Live score not yet connected
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-slate-400 text-right">Away</p>
                <p className="text-lg font-bold text-slate-100">{awayTeam}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {probabilityHistory.length === 0 ? (
              <div className="w-full h-[28rem] bg-slate-900/50 border border-slate-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-slate-400 font-sans mb-1">
                    {hasInitialData
                      ? "No usable odds in initial snapshot — waiting for live data…"
                      : "No initial data. Waiting for the server to send real-time data…"}
                  </p>
                  <p className="text-xs text-slate-600 font-mono">
                    No updates received yet
                  </p>
                </div>
              </div>
            ) : (
              <ProbabilityChart
                data={probabilityHistory}
                homeTeam={homeTeam as string}
                awayTeam={awayTeam as string}
              />
            )}

            {marketStatus && (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Market Activity
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-2 rounded-full border ${
                      marketStatus === "JUSTIFIED"
                        ? "bg-green-500/20 border-green-500/50"
                        : "bg-amber-500/20 border-amber-500/50"
                    }`}
                  >
                    <span
                      className={`text-sm font-mono font-bold ${
                        marketStatus === "JUSTIFIED"
                          ? "text-green-400"
                          : "text-amber-400"
                      }`}
                    >
                      {marketStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event feed removed until a scores/events data source is wired */}
        </div>
      </div>
    </main>
  );
}
