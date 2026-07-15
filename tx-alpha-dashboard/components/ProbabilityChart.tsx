"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { ProbabilityPoint } from "@/lib/mock-data";

interface ProbabilityChartProps {
  data: ProbabilityPoint[];
  homeTeam: string;
  awayTeam: string;
}

// Shape of what the Merkle proof endpoint will eventually return.
// Swap the dummy object in VerifyProofModal for a real fetch of this shape.
interface OddsProof {
  merkleRoot: string;
  leafHash: string;
  solanaSlot: string;
  fixtureId?: string;
  ts?: number;
}

const DUMMY_PROOF: OddsProof = {
  merkleRoot: "0x7a3f9e2c1b8d4f6a0e5c3b9d7f1a4e8c891",
  leafHash: "0x2d91b7c4a8f0e3d6c9b1a5f7e2d8c44be",
  solanaSlot: "301,842,119",
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VerifyProofModal({
  proof,
  onClose,
}: {
  proof: OddsProof;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border-2 border-ink bg-newsprint p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink" />
            <span className="font-headline font-semibold text-sm uppercase tracking-widest">
              Odds verification
            </span>
          </div>
          <button
            onClick={onClose}
            className="border border-ink/40 p-1 hover:bg-ink hover:text-newsprint transition-colors"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <dl className="mt-4 space-y-3 font-press text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft uppercase tracking-[0.15em]">
              Merkle root
            </dt>
            <dd className="truncate text-ink">{proof.merkleRoot}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft uppercase tracking-[0.15em]">
              Leaf hash
            </dt>
            <dd className="truncate text-ink">{proof.leafHash}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft uppercase tracking-[0.15em]">
              Anchored at
            </dt>
            <dd className="text-ink">Solana slot {proof.solanaSlot}</dd>
          </div>
        </dl>

        <p className="mt-4 border-t border-dashed border-ink pt-3 font-body text-[11px] leading-relaxed text-ink-soft">
          This is placeholder data. Wire this panel up to the odds Merkle proof
          endpoint, keyed by fixture id and the timestamp of the point that was
          clicked.
        </p>
      </div>
    </div>
  );
}

export function ProbabilityChart({
  data,
  homeTeam,
  awayTeam,
}: ProbabilityChartProps) {
  return (
    <div className="relative h-[420px] w-full">
      {/*  indicator + verify chip, grouped top-right */}
      <div className="absolute right-0 top-0 flex items-center gap-2">
        <div className="border-2 border-ink px-2 py-1">
          <span className="font-press text-[10px] uppercase tracking-[0.3em]">
            LIVE
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-5 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-400" />
          <span className="text-sm font-medium text-ink">{homeTeam}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-violet-400" />
          <span className="text-sm font-medium text-ink">{awayTeam}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="92%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="2 6"
            stroke="rgba(148,163,184,.12)"
          />

          <ReferenceLine y={25} stroke="#475569" strokeDasharray="2 10" />
          <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 4" />
          <ReferenceLine y={75} stroke="#475569" strokeDasharray="2 10" />

          <XAxis
            dataKey="ts"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTime}
            tick={{
              fill: "#94a3b8",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[10, 25, 35, 50, 60, 75, 90, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{
              fill: "#94a3b8",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            width={42}
          />

          <Tooltip
            cursor={{
              stroke: "#475569",
              strokeWidth: 1,
            }}
            contentStyle={{
              background: "#f5f5f5",
              border: "2px solid #1a1a1a",
              borderRadius: 0,
              padding: "10px 12px",
              color: "#1a1a1a",
              fontFamily: "JetBrains Mono, monospace",
              boxShadow: "none",
            }}
            labelStyle={{
              color: "#1a1a1a",
              fontWeight: 700,
              marginBottom: 8,
            }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);
              return [
                `${Number.isFinite(num) ? num.toFixed(1) : "—"}%`,
                String(name),
              ];
            }}
            labelFormatter={(label, payload) => {
              const point = payload?.[0]?.payload as
                | ProbabilityPoint
                | undefined;
              const ts = typeof label === "number" ? label : Number(label);

              return point
                ? `${formatTime(ts)} • ${point.minute}'`
                : Number.isFinite(ts)
                  ? formatTime(ts)
                  : "";
            }}
          />

          <Area
            type="monotone"
            dataKey="home"
            name={homeTeam}
            stroke="#38bdf8"
            strokeWidth={3}
            fill="url(#homeGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#38bdf8",
              stroke: "#0f172a",
              strokeWidth: 3,
            }}
            animationDuration={300}
          />

          <Area
            type="monotone"
            dataKey="away"
            name={awayTeam}
            stroke="#a855f7"
            strokeWidth={3}
            fill="url(#awayGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#a855f7",
              stroke: "#0f172a",
              strokeWidth: 3,
            }}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
