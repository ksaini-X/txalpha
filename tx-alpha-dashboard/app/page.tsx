'use client'

import Link from 'next/link'
import { TrendingUp, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-blue-900/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Hero Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-cyan-400 font-sans">
          TxAlpha
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-2xl">
          Real-time market intelligence for live football
        </p>

        {/* Description */}
        <p className="text-slate-400 text-base md:text-lg max-w-3xl mb-12 leading-relaxed">
          Transform raw World Cup odds and event data into live implied-probability charts,
          event commentary, and verified match settlement. Trade with precision using
          institutional-grade market intelligence.
        </p>

        {/* CTA Button */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors duration-200 font-sans"
        >
          <TrendingUp className="w-5 h-5" />
          View Live Matches
        </Link>

        {/* Footer text */}
        <p className="text-slate-500 text-sm mt-16">
          Live updates • Market-driven data • Verified settlement
        </p>
      </div>
    </main>
  )
}
