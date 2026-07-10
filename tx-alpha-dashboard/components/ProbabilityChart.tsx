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
import { ProbabilityPoint } from "@/lib/mock-data";

interface ProbabilityChartProps {
  data: ProbabilityPoint[];
  homeTeam: string;
  awayTeam: string;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProbabilityChart({
  data,
  homeTeam,
  awayTeam,
}: ProbabilityChartProps) {
  return (
    <div className="relative h-[420px] w-full">
      {/* Live Indicator */}
      <div className="absolute right-0 top-0 border-2 border-ink px-2 py-1">
        <span className="font-press text-[10px] uppercase tracking-[0.3em]">
          LIVE
        </span>
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

          <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 4" />

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
            ticks={[25, 50, 75, 100]}
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
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              padding: "12px 14px",
              color: "#fff",
            }}
            labelStyle={{
              color: "#e2e8f0",
              fontWeight: 600,
              marginBottom: 8,
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name,
            ]}
            labelFormatter={(ts: number, payload) => {
              const point = payload?.[0]?.payload as
                | ProbabilityPoint
                | undefined;

              return point
                ? `${formatTime(ts)} • ${point.minute}'`
                : formatTime(ts);
            }}
          />

          <Area
            type="stepAfter"
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
