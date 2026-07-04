import Link from "next/link";
import {
  mockMatches,
  mockProbabilityHistory,
  mockEvents,
  mockSettlement,
} from "@/lib/mock-data";
import { ProbabilityChart } from "@/components/ProbabilityChart";
import { EventFeed } from "@/components/EventFeed";
import { StatCard } from "@/components/StatCard";
import { SettlementPanel } from "@/components/SettlementPanel";
import { ArrowLeft, TrendingUp, AlertCircle } from "lucide-react";

export async function generateStaticParams() {
  return mockMatches.map((match) => ({
    id: match.id,
  }));
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const match = mockMatches.find((m) => m.id === id);

  // TODO: Replace with WebSocket data
  const probabilityHistory = mockProbabilityHistory;
  const events = mockEvents;
  const isFinished = match?.status === "Finished";

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Match not found</p>
          <Link href="/matches" className="text-cyan-400 hover:text-cyan-300">
            Back to matches
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-sans">Back to matches</span>
          </Link>

          {/* Match Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{match.homeFlag}</span>
              <div>
                <p className="text-sm text-slate-400">Home</p>
                <p className="text-lg font-bold text-slate-100">
                  {match.homeTeam}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-cyan-400 mb-1">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="flex items-center justify-center gap-1">
                {match.status === "LIVE" && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
                    <span className="font-mono text-sm font-bold text-red-400">
                      {match.minute}&apos;
                    </span>
                  </>
                )}
                {match.status === "Finished" && (
                  <span className="font-mono text-sm text-slate-400">FT</span>
                )}
                {match.status === "Upcoming" && (
                  <span className="font-mono text-sm text-slate-400">TBA</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-slate-400 text-right">Away</p>
                <p className="text-lg font-bold text-slate-100">
                  {match.awayTeam}
                </p>
              </div>
              <span className="text-3xl">{match.awayFlag}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Stats (65%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Probability Chart */}
            <ProbabilityChart
              data={probabilityHistory}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
            />

            {/* Match Statistics */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-mono font-bold text-slate-300 mb-4 uppercase tracking-wider">
                Match Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Possession" homeValue="58%" awayValue="42%" />
                <StatCard label="Shots" homeValue="12" awayValue="8" />
                <StatCard label="Corners" homeValue="6" awayValue="4" />
                <StatCard label="Cards" homeValue="1" awayValue="2" />
              </div>
            </div>

            {/* Market Activity */}
            {match.status === "LIVE" && (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Market Activity
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-full bg-green-500/20 border border-green-500/50">
                    <span className="text-sm font-mono font-bold text-green-400">
                      JUSTIFIED
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Recent odds movements align with match momentum. Home team
                    dominating and implied probability correctly increased.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Feed (35%) */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Live Activity
                </h3>
              </div>
              <EventFeed events={events} />
            </div>
          </div>
        </div>

        {/* Settlement Panel - Only show if finished */}
        {isFinished && (
          <SettlementPanel
            homeTeam={mockSettlement.homeTeam}
            awayTeam={mockSettlement.awayTeam}
            finalScore={mockSettlement.finalScore}
            winner={mockSettlement.winner}
            verifiedHash={mockSettlement.verifiedHash}
            verifiedAt={mockSettlement.verifiedAt}
          />
        )}
      </div>
    </main>
  );
}
