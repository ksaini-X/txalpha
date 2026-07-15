// app/match/[id]/page.tsx
"use client";

import Link from "next/link";
import { ProbabilityChart } from "@/components/ProbabilityChart";
import { ArrowLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Fixture } from "@/app/types";
import toast from "react-hot-toast";
import { CommentaryFeed } from "@/components/CommantaryFeed";

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
  participant: number;
}
interface CommentaryEntry {
  text: string;
  ts: number;
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
  const [commentaryFeed, setCommentaryFeed] = useState<CommentaryEntry[]>([]);

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

      if (Array.isArray(msg)) {
        const found = msg.find((f: Fixture) => f.fixtureId === Number(id));
        if (found) setFixture(found);
        return;
      }

      if (msg.type === "snapshot") {
        toast.success("Odds snaphot", {
          position: "bottom-right",
        });
        setHasInitialData(true);

        const relevant = (msg.data as any[]).filter(
          (d) => d.superOddsType === "1X2_PARTICIPANT_RESULT",
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
          .sort((a, b) => a.ts - b.ts);

        if (points.length > 0) {
          setProbabilityHistory(points);
        }
        return;
      }

      if (msg.type === "update" || (!Array.isArray(msg.data) && msg.data)) {
        toast.success("Odds Update", {
          position: "bottom-right",
        });
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

      if (msg.type === "score_snapshot") {
        toast.success("Score Snapshot", {
          position: "bottom-right",
        });
        const latest = msg.data[msg.data.length - 1];
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

      if (msg.type === "commentary") {
        toast.success("Commentary Update", {
          position: "bottom-right",
        });
        const text = msg.text as string;
        const ts = msg.ts as number;
        if (!text) return;

        setCommentaryFeed((prev) => {
          const updated = [{ text, ts }, ...prev];
          return updated.slice(0, 15);
        });
        return;
      }

      if (msg.type === "score_update") {
        toast.success("Score Update", {
          position: "bottom-right",
        });
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
            ...prev,
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
      <main className=" bg-newsprint text-ink font-body">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-32">
          <div className="w-full max-w-xl border-y-4  py-10 text-center">
            <p className="font-press text-[11px] uppercase tracking-[0.35em] text-ink-soft">
              Match Desk
            </p>

            <h1 className="mt-4 font-headline text-4xl">Loading Match</h1>

            <p className="mt-3 font-body text-sm text-ink-soft">
              Retrieving fixture data...
            </p>
          </div>
        </div>
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
  const kickoffLabel = kickoffDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className=" bg-newsprint text-ink font-body">
      <div className="relative">
        <header className="sticky top-0 z-20  border-ink bg-newsprint">
          <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-4  ">
            <Link
              href="/matches"
              className="flex h-11 w-11 shrink-0 items-center justify-center  transition-colors hover:bg-ink hover:text-newsprint"
            >
              <ArrowLeft className="h-10 w-10" />
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-5">
                  <h1 className="max-w-55  font-headline text-2xl lg:text-4xl">
                    {homeTeam}
                  </h1>

                  {liveScore ? (
                    <div className="flex items-center border-2 border-ink px-5 py-2">
                      <span className="w-8 text-center font-headline text-3xl tabular-nums">
                        {liveScore.home}
                      </span>

                      <span className="mx-3 font-headline text-2xl">—</span>

                      <span className="w-8 text-center font-headline text-3xl tabular-nums">
                        {liveScore.away}
                      </span>
                    </div>
                  ) : (
                    <div className=" px-4 py-2">
                      <span className="font-press text-[11px] uppercase tracking-[0.35em]">
                        VS
                      </span>
                    </div>
                  )}

                  <h1 className="max-w-[220px]  font-headline text-2xl lg:text-4xl">
                    {awayTeam}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-">
          <div className="mb-6 border-y border-ink">
            <div className="grid divide-ink md:grid-cols-3 md:divide-x">
              <div className="px-5 py-2">
                <p className="font-press text-[9px] uppercase tracking-[0.35em] text-ink-soft">
                  Kickoff
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-headline text-lg">{kickoffLabel}</span>
                </div>
              </div>

              <div className="px-5 py-2">
                <p className="font-press text-[9px] uppercase tracking-[0.35em] text-ink-soft">
                  Market Status
                </p>

                <p className="mt-1 font-headline text-lg">{marketStatus}</p>
              </div>

              <div className="px-5 py-2">
                <p className="font-press text-[9px] uppercase tracking-[0.35em] text-ink-soft">
                  Samples
                </p>

                <p className="mt-1 font-headline text-lg tabular-nums">
                  {probabilityHistory.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 lg:grid-cols-4 ">
            <div className="space-y-2 lg:col-span-3">
              <div className=" border-ink bg-newsprint p-">
                <div className="mb-4 border-b border-ink pb-3">
                  <h2 className="font-headline text-2xl">
                    Probability Movement
                  </h2>
                </div>

                {probabilityHistory.length === 0 ? (
                  <div className="flex h-[450px] items-center justify-center">
                    <div className="text-center">
                      <p className="font-press text-[11px] uppercase tracking-[0.35em] text-ink-soft">
                        Loading
                      </p>

                      <p className="mt-4 font-headline text-2xl">
                        {hasInitialData
                          ? "Waiting for live odds..."
                          : "Connecting to market feed..."}
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
            </div>

            <CommentaryFeed
              commentaryFeed={commentaryFeed}
              fixtureId={fixture.fixtureId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
