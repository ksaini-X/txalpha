"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

  const statusLabel = {
    live: "LIVE",
    upcoming: "SCHEDULED",
    finished: "FINAL",
  }[status];

  return (
    <Link href={`/match/${match.fixtureId}`} className="group block">
      <article
        className="
          h-full
          border-2 border-ink
          bg-newsprint
          p-5
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-[6px_6px_0_0_#1a1a1a]
        "
      >
        <div className="flex items-start justify-between border-b border-ink pb-3">
          <div>
            <p className="mt-1 font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
              Fixture <span className="font-semibold">#{match.fixtureId}</span>
            </p>
          </div>

          <span
            className={`border px-2 py-1 font-press text-[10px] uppercase tracking-[0.25em] ${
              status === "live"
                ? "border-ink font-bold"
                : "border-stamp text-ink-soft"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="my-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="truncate font-headline text-2xl leading-tight">
              {homeTeam}
            </h3>

            <span className="shrink-0 font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
              HOME
            </span>
          </div>

          <div className="my-4 border-t border-dashed border-ink" />

          <div className="flex items-center justify-between gap-4">
            <h3 className="truncate font-headline text-2xl leading-tight">
              {awayTeam}
            </h3>

            <span className="shrink-0 font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
              AWAY
            </span>
          </div>
        </div>
        <div className="border-t border-ink pt-4">
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                Date
              </p>

              <p className="mt-1 font-body text-sm">
                {new Date(match.startTime).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                Kickoff
              </p>

              <p className="mt-1 font-body text-sm">
                {new Date(match.startTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                IST
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink pt-3">
          <p className="font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
            Open Match Report
          </p>

          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </article>
    </Link>
  );
}
