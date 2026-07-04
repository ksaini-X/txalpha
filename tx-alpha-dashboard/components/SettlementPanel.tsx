'use client'

import { Check } from 'lucide-react'

interface SettlementPanelProps {
  homeTeam: string
  awayTeam: string
  finalScore: string
  winner: string
  verifiedHash: string
  verifiedAt: string
}

export function SettlementPanel({
  homeTeam,
  awayTeam,
  finalScore,
  winner,
  verifiedHash,
  verifiedAt,
}: SettlementPanelProps) {
  const formattedTime = new Date(verifiedAt).toLocaleString()

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Check className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-sans font-bold text-slate-100">
          Verified Settlement
        </h3>
      </div>

      {/* Result Summary */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-2">Final Result</p>
          <p className="text-3xl font-mono font-bold text-cyan-400 mb-2">
            {finalScore}
          </p>
          <p className="text-sm font-sans font-medium text-slate-200">
            {winner} wins
          </p>
        </div>
      </div>

      {/* Hash */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">On-chain verification hash:</p>
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-700/50 break-all">
          <code className="text-xs font-mono text-cyan-400">
            {verifiedHash}
          </code>
        </div>
      </div>

      {/* Verified At */}
      <div className="text-xs text-slate-400">
        <span className="text-green-400 font-bold">✓</span> Verified on-chain at{' '}
        <span className="font-mono text-cyan-400">{formattedTime}</span>
      </div>
    </div>
  )
}
