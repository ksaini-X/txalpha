'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockMatches } from '@/lib/mock-data'
import { MatchCard } from '@/components/MatchCard'
import { ArrowLeft } from 'lucide-react'

type FilterStatus = 'all' | 'LIVE' | 'Upcoming' | 'Finished'

export default function MatchesPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filteredMatches =
    filter === 'all'
      ? mockMatches
      : mockMatches.filter((m) => m.status === filter)

  const liveCount = mockMatches.filter((m) => m.status === 'LIVE').length
  const upcomingCount = mockMatches.filter((m) => m.status === 'Upcoming').length
  const finishedCount = mockMatches.filter((m) => m.status === 'Finished').length

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-sans">Back</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 font-sans flex-1">
              TxAlpha Live Matches
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { label: 'All Matches', value: 'all' as FilterStatus },
              {
                label: `Live (${liveCount})`,
                value: 'LIVE' as FilterStatus,
              },
              {
                label: `Upcoming (${upcomingCount})`,
                value: 'Upcoming' as FilterStatus,
              },
              {
                label: `Finished (${finishedCount})`,
                value: 'Finished' as FilterStatus,
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              No matches found for this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/50 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>
            Data updates every 5 seconds • Click any match for detailed market intelligence
          </p>
        </div>
      </div>
    </main>
  )
}
