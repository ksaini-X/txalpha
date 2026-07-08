"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/MatchCard";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { Fixture } from "../types";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Fixture[]>([]);
  const { loading, socket } = useSocket();

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

  console.log(matches);
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-sans">Back</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 font-sans flex-1">
              TxAlpha Live Matches
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((match) => (
            <MatchCard key={match.fixtureId} match={match} />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800/50 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>
            Data updates every 5 seconds • Click any match for detailed market
            intelligence
          </p>
        </div>
      </div>
    </main>
  );
}
