"use client";

import Link from "next/link";
import { Fixture } from "@/app/types";
import { getFlag } from "@/lib/country-flags";

interface MatchCardProps {
  match: Fixture;
}

function getStatus(startTime: number): "upcoming" | "live" | "finished" {
  const now = Date.now();
  const matchDurationMs = 2 * 60 * 60 * 1000;
  if (now < startTime) return "upcoming";
  if (now >= startTime && now < startTime + matchDurationMs) return "live";
  return "finished";
}

export function MatchCard({ match }: MatchCardProps) {
  const status = getStatus(match.startTime);
  const homeTeam = match.participant1IsHome
    ? match.participant1
    : match.participant2;
  const awayTeam = match.participant1IsHome
    ? match.participant2
    : match.participant1;

  return (
    <Link href={`/match/${match.fixtureId}`}>
      <div className="group h-full rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-500/10">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          {status === "live" ? (
            <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">LIVE</span>
            </div>
          ) : (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {status}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
            <span className="font-semibold text-lg text-white">{homeTeam}</span>
            <span className="text-slate-500 text-sm">HOME</span>
          </div>

          <div className="flex justify-center">
            <span className="rounded-full border border-slate-700 px-4 py-1 text-xs font-bold tracking-[0.25em] text-slate-500">
              VS
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
            <span className="font-semibold text-lg text-white">{awayTeam}</span>
            <span className="text-slate-500 text-sm">AWAY</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="font-medium text-slate-300">
            {new Date(match.startTime).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
