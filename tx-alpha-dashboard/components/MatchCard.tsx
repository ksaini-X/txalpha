"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock3, Radio } from "lucide-react";
import { Fixture } from "@/app/types";

interface MatchCardProps {
  match: Fixture;
}

function getStatus(startTime: number): "upcoming" | "live" | "finished" {
  const now = Date.now();
  const matchDurationMs = 2 * 60 * 60 * 1000;

  if (now < startTime) return "upcoming";
  if (now < startTime + matchDurationMs) return "live";

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
    <Link href={`/match/${match.fixtureId}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-[0_0_25px_rgba(6,182,212,.12)]">
        {/* Accent */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Football
          </span>

          {status === "live" ? (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1">
              <Radio className="h-3 w-3 animate-pulse text-red-400" />
              <span className="text-[11px] font-bold text-red-400">LIVE</span>
            </div>
          ) : (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                status === "upcoming"
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {status.toUpperCase()}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="truncate text-lg font-semibold text-white">
              {homeTeam}
            </span>

            <span className="text-xs uppercase text-slate-500">HOME</span>
          </div>

          <div className="mx-auto h-px bg-slate-800" />

          <div className="flex items-center justify-between">
            <span className="truncate text-lg font-semibold text-white">
              {awayTeam}
            </span>

            <span className="text-xs uppercase text-slate-500">AWAY</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-cyan-400" />

              {new Date(match.startTime).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-cyan-400" />

              {new Date(match.startTime).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <ArrowUpRight className="h-5 w-5 text-slate-600 transition-all group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
