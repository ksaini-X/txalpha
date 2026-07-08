"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Wifi, WifiOff } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { useSocket } from "@/hooks/useSocket";
import { Fixture } from "../types";
import { getStatus } from "@/lib/get-status";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleOpen = () => {
      socket.send(JSON.stringify({ type: "GetMatches" }));
    };

    const handleMessage = (event: MessageEvent) => {
      const parsedMatches: Fixture[] = JSON.parse(event.data);
      setMatches(parsedMatches);
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);

    if (socket.readyState === WebSocket.OPEN) {
      handleOpen();
    }

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background Grid */}
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

      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-cyan-400"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>

              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-white">Tx</span>
                  <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Alpha
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 pt-12 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                Live Football Markets
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
                Follow real-time odds, market movement, AI commentary, and
                verified settlement across every live fixture.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-5 text-center">
              <p className="text-sm uppercase tracking-widest text-slate-500">
                Active Matches
              </p>

              <p className="mt-2 text-4xl font-black text-cyan-400">
                {matches.length}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          {matches.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />

              <h3 className="text-xl font-semibold">Loading Live Matches</h3>

              <p className="mt-2 text-slate-400">
                Waiting for live market data...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...matches]
                .sort((a, b) => {
                  const statusOrder = {
                    live: 0,
                    upcoming: 1,
                    finished: 2,
                  };

                  const statusA = getStatus(a.startTime);
                  const statusB = getStatus(b.startTime);

                  // Live → Upcoming → Finished
                  if (statusOrder[statusA] !== statusOrder[statusB]) {
                    return statusOrder[statusA] - statusOrder[statusB];
                  }

                  // Within the same status, sort by start time
                  return a.startTime - b.startTime;
                })
                .map((match) => (
                  <MatchCard key={match.fixtureId} match={match} />
                ))}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-800/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">
            <p>
              Live updates • AI Commentary • Probability Engine • Verified
              Settlement
            </p>

            <p>Real-time WebSocket Streaming</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
