"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { useSocket } from "@/hooks/useSocket";
import { getStatus } from "@/lib/get-status";
import { Fixture } from "../types";

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
    <main className="min-h-screen bg-newsprint text-ink font-body">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        {/* was border-b-2 — hairline matches the front page's section rule */}
        <header className="border-b border-ink flex items-center justify-between py-5">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="border border-ink/70 p-2 transition-colors hover:bg-ink hover:text-newsprint"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              {/* was font-headline default (bold) — semibold + tight tracking to match the nameplate treatment */}
              <h1 className="font-headline font-semibold tracking-tight text-3xl sm:text-4xl text-ink">
                Match Desk
              </h1>

              <p className="mt-1.5 font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                TxLINE Live Data Feed
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
              Active Fixtures
            </p>

            <p className="font-headline font-semibold text-3xl text-ink mt-0.5">
              {matches.length}
            </p>
          </div>
        </header>

        <section className="my-8">
          {matches.length === 0 ? (
            // was border-y-4 — heavy double rule swapped for a single top/bottom hairline
            <div className="border-y border-ink/30 py-16 text-center">
              <p className="font-press text-[11px] uppercase tracking-[0.3em] text-ink-soft">
                Receiving Live Feed
              </p>

              <h3 className="mt-3 font-headline font-semibold tracking-tight text-2xl text-ink">
                Awaiting match data
              </h3>

              <p className="mt-2 font-press text-sm text-ink-soft">
                Establishing connection to the TxLINE network&hellip;
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

                  if (statusOrder[statusA] !== statusOrder[statusB]) {
                    return statusOrder[statusA] - statusOrder[statusB];
                  }

                  return a.startTime - b.startTime;
                })
                .map((match) => (
                  <MatchCard key={match.fixtureId} match={match} />
                ))}
            </div>
          )}
        </section>

        {/* Footer — was border-t-4, now matches the front page's colophon weight */}
        <footer className="mt-10 border-t-2 border-ink">
          <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
            <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
              Live odds &middot; AI commentary &middot; Verified settlement
            </p>

            <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
              TxLINE Data Network
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
