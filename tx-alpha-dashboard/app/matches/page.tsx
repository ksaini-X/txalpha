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
        <header className="border-b-2 flex items-center justify-between py-4">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="border border-ink p-2 transition-colors hover:bg-ink hover:text-newsprint"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <h1 className="font-headline text-4xl sm:text-5xl">MATCH DESK</h1>

              <p className="mt-2 font-press text-[11px] uppercase tracking-[0.3em] text-ink-soft">
                TxLINE Live Data Feed
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
              Active Fixtures
            </p>

            <p className="font-headline text-4xl">{matches.length}</p>
          </div>
        </header>

        <section className=" grid grid-cols-1 gap-8 lg:grid-cols-3"></section>

        <section className="my-6">
          {matches.length === 0 ? (
            <div className="border-y-4 border-ink py-20 text-center">
              <p className="font-press text-[11px] uppercase tracking-[0.35em] text-ink-soft">
                Receiving Live Feed
              </p>

              <h3 className="mt-4 font-headline text-3xl">
                Awaiting Match Data
              </h3>

              <p className="mt-3 font-body text-sm text-ink-soft">
                Establishing connection to the TxLINE network...
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

        {/* Footer */}
        <footer className="mt-12 border-t-4 border-ink">
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <p className="font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
              Live Odds • AI Commentary • Verified Settlement
            </p>

            <p className="font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
              TxLINE Data Network
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
