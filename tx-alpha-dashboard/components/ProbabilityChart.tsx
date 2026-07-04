"use client";

import {
  LineChart,
  Line,
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

export function ProbabilityChart({
  data,
  homeTeam,
  awayTeam,
}: ProbabilityChartProps) {
  return (
    <div className="w-full h-80 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(100, 116, 139, 0.3)"
          />
          <XAxis
            dataKey="minute"
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            label={{
              value: "Minute'",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            label={{
              value: "Probability %",
              angle: -90,
              position: "insideLeft",
            }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f1530",
              border: "1px solid rgba(0, 217, 255, 0.3)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#e0e5f5" }}
            formatter={(value) => [`${value}%`, ""]}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="home"
            stroke="#00d9ff"
            strokeWidth={2}
            dot={{ fill: "#00d9ff", r: 4 }}
            activeDot={{ r: 6 }}
            name={homeTeam}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="away"
            stroke="#00ff88"
            strokeWidth={2}
            dot={{ fill: "#00ff88", r: 4 }}
            activeDot={{ r: 6 }}
            name={awayTeam}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
