"use client";

import Link from "next/link";
import { TrendingUp, Zap, ShieldCheck, Activity, Radio } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const { socket } = useSocket();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-[300px] w-[300px] rounded-full bg-cyan-400/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_60px_rgba(6,182,212,.25)]">
          <Zap className="h-10 w-10 text-cyan-400" />
        </div>

        <h1 className="text-6xl font-black tracking-tight md:text-8xl">
          <span className="text-white">Tx</span>
          <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Alpha
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-xl font-medium text-slate-300 md:text-2xl">
          Understand the market before everyone else.
        </p>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Track live odds, implied probability movement, AI-powered event
          commentary, and verified match settlement—all from a single real-time
          dashboard.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-10 py-4 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,.45)]"
          >
            <TrendingUp className="h-5 w-5" />
            View Live Matches
          </Link>
        </div>

        <p className="mt-16 text-sm uppercase tracking-[0.35em] text-slate-500">
          Live Odds • AI Commentary • Probability Engine • Verified Settlement
        </p>
      </div>
    </main>
  );
}
