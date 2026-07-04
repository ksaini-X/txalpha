'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  homeValue: number | string
  awayValue: number | string
  icon?: ReactNode
  unit?: string
}

export function StatCard({
  label,
  homeValue,
  awayValue,
  icon,
  unit = '',
}: StatCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="stat-mono text-cyan-400">
            {homeValue}
          </span>
          <span className="text-xs text-slate-500 ml-1">{unit}</span>
        </div>
        <span className="text-xs text-slate-500">vs</span>
        <div className="text-right">
          <span className="stat-mono text-cyan-400">
            {awayValue}
          </span>
          <span className="text-xs text-slate-500 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  )
}
