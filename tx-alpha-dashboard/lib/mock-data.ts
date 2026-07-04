// TODO: Replace with WebSocket data
export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'LIVE' | 'Upcoming' | 'Finished'
  impliedProbability: {
    home: number
    draw: number
    away: number
  }
  recentTrend: number[] // sparkline data (7 recent points)
}

export interface MatchEvent {
  id: string
  minute: number
  type: 'goal' | 'card' | 'corner' | 'shot' | 'possession'
  text: string
  commentary: string
  team: string
}

export interface ProbabilityPoint {
  minute: number
  home: number
  away: number
}

// TODO: Replace with WebSocket data
export const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Argentina',
    awayTeam: 'France',
    homeFlag: '🇦🇷',
    awayFlag: '🇫🇷',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: 'LIVE',
    impliedProbability: {
      home: 62,
      draw: 18,
      away: 20,
    },
    recentTrend: [45, 50, 55, 58, 60, 62, 62],
  },
  {
    id: '2',
    homeTeam: 'Brazil',
    awayTeam: 'Germany',
    homeFlag: '🇧🇷',
    awayFlag: '🇩🇪',
    homeScore: 1,
    awayScore: 0,
    minute: 34,
    status: 'LIVE',
    impliedProbability: {
      home: 58,
      draw: 22,
      away: 20,
    },
    recentTrend: [50, 52, 54, 55, 57, 58, 58],
  },
  {
    id: '3',
    homeTeam: 'England',
    awayTeam: 'Spain',
    homeFlag: '🇬🇧',
    awayFlag: '🇪🇸',
    homeScore: 0,
    awayScore: 2,
    minute: 42,
    status: 'LIVE',
    impliedProbability: {
      home: 25,
      draw: 20,
      away: 55,
    },
    recentTrend: [48, 45, 40, 35, 30, 27, 25],
  },
  {
    id: '4',
    homeTeam: 'Netherlands',
    awayTeam: 'Belgium',
    homeFlag: '🇳🇱',
    awayFlag: '🇧🇪',
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    status: 'Upcoming',
    impliedProbability: {
      home: 52,
      draw: 24,
      away: 24,
    },
    recentTrend: [50, 51, 52, 52, 52, 52, 52],
  },
  {
    id: '5',
    homeTeam: 'Italy',
    awayTeam: 'Portugal',
    homeFlag: '🇮🇹',
    awayFlag: '🇵🇹',
    homeScore: 3,
    awayScore: 1,
    minute: 90,
    status: 'Finished',
    impliedProbability: {
      home: 85,
      draw: 10,
      away: 5,
    },
    recentTrend: [45, 50, 55, 65, 75, 82, 85],
  },
]

// TODO: Replace with WebSocket data
export const mockProbabilityHistory: ProbabilityPoint[] = [
  { minute: 0, home: 48, away: 52 },
  { minute: 10, home: 50, away: 50 },
  { minute: 20, home: 52, away: 48 },
  { minute: 30, home: 55, away: 45 },
  { minute: 40, home: 58, away: 42 },
  { minute: 50, home: 60, away: 40 },
  { minute: 60, home: 62, away: 38 },
]

// TODO: Replace with WebSocket data
export const mockEvents: MatchEvent[] = [
  {
    id: '1',
    minute: 67,
    type: 'goal',
    text: 'Messi goal (Argentina)',
    commentary: 'Stunning finish from Messi doubles the lead after a brilliant counter-attack.',
    team: 'Argentina',
  },
  {
    id: '2',
    minute: 62,
    type: 'card',
    text: 'Yellow card to Mbappé',
    commentary: 'Mbappé shown yellow for a reckless challenge in midfield.',
    team: 'France',
  },
  {
    id: '3',
    minute: 55,
    type: 'goal',
    text: 'Martínez goal (Argentina)',
    commentary: 'Enzo Martínez puts Argentina ahead with a well-taken finish.',
    team: 'Argentina',
  },
  {
    id: '4',
    minute: 45,
    type: 'possession',
    text: 'Argentina 55% - France 45%',
    commentary: 'Argentina dominating possession as we enter the second half.',
    team: 'Argentina',
  },
  {
    id: '5',
    minute: 38,
    type: 'corner',
    text: 'Corner awarded to France',
    commentary: 'France awarded a corner after Argentina clears a cross.',
    team: 'France',
  },
]

// TODO: Replace with WebSocket data
export const mockSettlement = {
  matchId: '5',
  homeTeam: 'Italy',
  awayTeam: 'Portugal',
  finalScore: '3-1',
  winner: 'Italy',
  verifiedHash: '0x4a7c8d9e2f5a1b6c3e8d4f9a2b7c5e1d',
  verifiedAt: '2024-12-18T20:45:00Z',
}
