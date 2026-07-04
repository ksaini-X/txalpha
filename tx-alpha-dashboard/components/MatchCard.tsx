'use client'

import Link from 'next/link'
import { Match } from '@/lib/mock-data'
import { Sparklines, SparklinesLine } from 'react-sparklines'

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'LIVE'
  const isFinished = match.status === 'Finished'

  return (
    <Link href={`/match/${match.id}`}>
      <div className="group relative p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer h-full">
        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
            <span className="text-xs font-mono font-bold text-red-400">LIVE</span>
          </div>
        )}

        {/* Status badge */}
        {!isLive && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                isFinished
                  ? 'bg-slate-700/50 text-slate-300'
                  : 'bg-slate-700/50 text-slate-300'
              }`}
            >
              {match.status}
            </span>
          </div>
        )}

        {/* Teams and Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{match.homeFlag}</span>
              <span className="text-sm font-sans text-slate-100 truncate">
                {match.homeTeam}
              </span>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {match.homeScore}-{match.awayScore}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                {match.minute}'
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm font-sans text-slate-100 truncate">
                {match.awayTeam}
              </span>
              <span className="text-2xl">{match.awayFlag}</span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mb-4 h-8 opacity-75 group-hover:opacity-100 transition-opacity">
          <Sparklines data={match.recentTrend} width={200} height={32}>
            <SparklinesLine color="#00d9ff" />
          </Sparklines>
        </div>

        {/* Implied Probabilities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">{match.homeTeam}</span>
            <span className="font-mono font-bold text-cyan-400">
              {match.impliedProbability.home}%
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-sm h-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${match.impliedProbability.home}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-3 mb-1">
            <span className="text-slate-400">{match.awayTeam}</span>
            <span className="font-mono font-bold text-cyan-400">
              {match.impliedProbability.away}%
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-sm h-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${match.impliedProbability.away}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
