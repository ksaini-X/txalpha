# TxAlpha - Live Sports Market Intelligence Dashboard

A real-time market intelligence dashboard for World Cup matches built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui components. Features a dark trading terminal aesthetic with live probability charts, event feeds, and verified settlement panels.

## Features

### 📊 Landing Page (`/`)
- Hero section with compelling tagline
- Call-to-action button linking to live matches
- Dark mode with electric blue accent color
- Subtle grid background and gradient overlay

### 🏟️ Live Matches (`/matches`)
- **Grid layout** (responsive: 1 col mobile → 3 col desktop)
- **Match cards** showing:
  - Team names with flag emojis
  - Live scores and match minute/status
  - Sparkline chart of probability trends
  - Implied win probability bars for each team
  - Pulsing "LIVE" indicator for active matches

- **Filter tabs**: Live, Upcoming, Finished
- **Clickable cards** linking to detailed match pages
- Real-time match counts in filter buttons

### ⚡ Match Detail (`/match/[id]`)

#### Left Column (65% width)
- **Probability chart**: Line chart showing home/away win probabilities over match minutes
  - Dual-line visualization (cyan for home, green for away)
  - Interactive tooltips
  - X-axis: match minute, Y-axis: probability %

- **Match statistics**: Side-by-side comparison cards
  - Possession
  - Shots
  - Corners
  - Cards

- **Market activity badge**: Shows if recent odds moves were "JUSTIFIED" or "OVERREACTION"

#### Right Column (35% width)
- **Live activity feed** with newest events at top
- Event icons by type (goal, card, corner, shot, possession)
- Match minute timestamps
- AI-generated commentary for each event
- Auto-fade-in animation for new events

#### Bottom (Full width - Finished matches only)
- **Verified settlement panel**
  - Final result display
  - Cryptographic proof hash (on-chain verification)
  - Verification timestamp
  - Green checkmark badge

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with custom dark theme
- **UI Components**: shadcn/ui + custom components
- **Charts**: Recharts for probability visualization
- **Sparklines**: react-sparklines for trend indicators
- **Icons**: Lucide React
- **Fonts**: 
  - JetBrains Mono (monospace for numbers/data)
  - Inter (sans-serif for UI text)

## Component Structure

```
components/
├── MatchCard.tsx          # Match preview card with sparkline
├── ProbabilityChart.tsx   # Recharts line chart for probabilities
├── EventFeed.tsx          # Live event list with commentary
├── StatCard.tsx           # Stat comparison boxes
└── SettlementPanel.tsx    # Finished match verification panel

app/
├── page.tsx              # Landing page
├── matches/
│   └── page.tsx         # Matches grid with filters
└── match/[id]/
    └── page.tsx         # Match detail page (dynamic)

lib/
└── mock-data.ts         # All mock data and types
```

## Design System

### Color Palette
- **Background**: `#0a0e27` (Slate-950)
- **Card**: `#0f1530` (Slate-900)
- **Primary Accent**: `#00d9ff` (Cyan - electric blue)
- **Secondary Accent**: `#00ff88` (Neon green)
- **Text**: `#e0e5f5` (Slate-50)
- **Borders**: `#1a1f3a` (Slate-700 at 50%)

### Typography
- **Headlines**: JetBrains Mono (bold, tracking-wide)
- **Body text**: Inter (leading-relaxed)
- **Stats/Data**: `.stat-mono` class - JetBrains Mono, bold, text-base

### Spacing & Borders
- Border radius: `0.5rem`
- Gap classes: Used consistently via Tailwind
- No margins/padding mix with gap on same element

## Mock Data

All data is mocked in `/lib/mock-data.ts` with clear TODO comments indicating where to add WebSocket integration:

```typescript
// Example structure
interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'LIVE' | 'Upcoming' | 'Finished'
  impliedProbability: { home: number; draw: number; away: number }
  recentTrend: number[] // sparkline data
}
```

### Available Mock Collections
- **mockMatches**: 5 sample matches across all statuses
- **mockProbabilityHistory**: 7 probability points (minute 0-60)
- **mockEvents**: 5 sample events (goals, cards, possession)
- **mockSettlement**: Sample finished match with hash

## Data Integration Points

All WebSocket integration points are clearly marked with TODO comments:

1. **Match data** → `mockMatches` in MatchCard, matches page
2. **Probability history** → `mockProbabilityHistory` in ProbabilityChart
3. **Live events** → `mockEvents` in EventFeed
4. **Settlement** → `mockSettlement` in SettlementPanel (finished matches only)

Replace these imports with real WebSocket listeners following the same data structures.

## Responsive Design

- **Mobile** (< 768px): Single column match grid
- **Tablet** (768px - 1024px): Two column grid
- **Desktop** (> 1024px): Three column grid
- **Match detail**: Stacks to single column on mobile, 2-column layout on desktop

## Custom CSS Classes

Defined in `/app/globals.css`:

```css
.terminal-glow       /* Shadow effect for trading terminal aesthetic */
.live-pulse          /* 1.5s pulsing animation for LIVE indicator */
.stat-mono           /* Monospace bold numbers with tight tracking */
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit `http://localhost:3000` to view the app.

## File Structure

```
/app
  /globals.css              # Tailwind + custom styles
  /layout.tsx               # Root layout with fonts
  /page.tsx                 # Landing page
  /matches/page.tsx         # Matches grid
  /match/[id]/page.tsx      # Match detail (server component)

/components
  /MatchCard.tsx            # Match preview card
  /ProbabilityChart.tsx     # Probability line chart
  /EventFeed.tsx            # Live event feed
  /StatCard.tsx             # Stat comparison
  /SettlementPanel.tsx      # Settlement verification

/lib
  /mock-data.ts             # Mock data structures & types
  /utils.ts                 # Utility functions (cn() for classnames)

/public
  # Static assets
```

## Next Steps

To connect real data:

1. **Setup WebSocket connection** in a custom hook (e.g., `useMatches()`)
2. **Replace mock data imports** with real API calls
3. **Update match detail page** to fetch dynamic data based on `[id]`
4. **Add real settlement verification** with blockchain integration
5. **Implement auto-refresh** for probability data (e.g., every 1-2 seconds)
6. **Add user authentication** if needed for premium features

## Performance Optimizations

- Server components for static content (landing page, layout)
- Client components only where interactivity needed (filter buttons, charts)
- Recharts optimized with `isAnimationActive={false}` for live data
- Responsive images and lazy loading ready
- Tailwind's built-in CSS minification

## Browser Support

Modern browsers supporting:
- ES2020+
- CSS Grid & Flexbox
- CSS Custom Properties
- SVG

## License

MIT
