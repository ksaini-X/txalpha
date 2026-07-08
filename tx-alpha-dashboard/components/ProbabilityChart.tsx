"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
    <div className="w-full h-80 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="awayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(100, 116, 139, 0.15)"
            vertical={false}
          />

          <XAxis
            dataKey="ts"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTime}
            stroke="#64748b"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "rgba(100, 116, 139, 0.3)" }}
            tickLine={false}
            minTickGap={40}
          />

          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1530",
              border: "1px solid rgba(0, 217, 255, 0.25)",
              borderRadius: "0.75rem",
              padding: "10px 14px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#e0e5f5", fontWeight: 600, marginBottom: 4 }}
            itemStyle={{ fontSize: "13px", padding: 0 }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name,
            ]}
            labelFormatter={(ts: number, payload) => {
              const point = payload?.[0]?.payload as
                | ProbabilityPoint
                | undefined;
              const time = formatTime(ts);
              return point ? `${time} · Minute ${point.minute}'` : time;
            }}
          />

          <Legend
            wrapperStyle={{
              color: "#94a3b8",
              fontSize: "12px",
              paddingTop: "8px",
            }}
            iconType="circle"
          />

          <Area
            type="monotone"
            dataKey="home"
            stroke="#00d9ff"
            strokeWidth={2.5}
            fill="url(#homeGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name={homeTeam}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="away"
            stroke="#00ff88"
            strokeWidth={2.5}
            fill="url(#awayGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name={awayTeam}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
