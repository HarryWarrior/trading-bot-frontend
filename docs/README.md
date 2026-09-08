# Trading Bot Frontend - Vue 3 + Nuxt 3

Professional frontend interface for real-time trading bot control with Vue 3 and Nuxt 3. Features comprehensive dashboard, account management, positions tracking, live charts, strategy control panel, and order management with beautiful Tailwind CSS design.

## Project Structure

```
trading-bot-frontend/
├── app.vue                    # Root component
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── components/
│   ├── Analytics/
│   │   ├── KpiCard.vue       # KPI display card
│   │   ├── EquityCurveChart  # Plotly equity curve
│   │   ├── CalendarHeatmap   # Daily performance heatmap
│   │   ├── TradesTable.vue   # Filtered trades table
│   │   └── TradeChartModal   # Lightweight charts modal
├── pages/
│   ├── index.vue             # Dashboard main
│   ├── upload.vue            # File ingestion
│   └── journal.vue           # Trading journal
├── docs/
│   ├── README.md             # This documentation file
│   ├── CHANGELOG.md          # Version history
│   ├── project-spec.md       # Project specification (SDD)
│   └── tech-spec.md          # Technical specification (SDD)
├── composables/
│   ├── useAnalytics.ts       # Analytics composable
│   └── useTradeComparison.ts # Comparison composable
├── stores/
│   └── analytics.ts          # Pinia store
└── types/
    ├── analytics.ts          # Core analytics types
    └── analytics.extended.ts # Extended trade types
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_API_VERSION=v1
```

### 3. Run Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

---

## 🧪 Testing and Build

```bash
# Typecheck
npx nuxi typecheck

# Production build
npm run build
```
