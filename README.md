# ParaLens — Monad Parallel Execution Visualizer

**Built for Monad** — See what standard explorers can't: how Monad executes transactions in parallel.

ParaLens is a **block explorer + performance dashboard** that visualizes Monad blockchain's core feature: **Optimistic Parallel Execution**. While standard explorers show raw block data, ParaLens answers: _"How many transactions in this block actually ran in parallel?"_

---

## What This App Does

| Feature | What It Shows |
|---------|--------------|
| **Live Block Explorer** | Real-time block feed from Monad testnet with auto-refresh |
| **Parallel Score** | 0-100 heuristic score per block — estimates how parallelized it was |
| **TX Timeline** | Color-coded timeline showing which transactions ran concurrently |
| **Gas Heatmap** | NxN grid visualization of gas usage per transaction |
| **Wallet Tracker** | Enter any address → see their transaction parallel efficiency |
| **Dashboard** | Network TPS, score distribution, Monad vs Ethereum comparison |
| **Shareable Blocks** | Each block detail page is shareable with metadata |

## How to Use

### 1. Home Page
Landing page with the **Ethereum vs Monad animation** — left side shows sequential execution, right side shows parallel. Click "Launch Explorer" to start.

### 2. Block Explorer (`/explorer`)
- Live-updating grid of recent blocks from Monad testnet
- Each card shows: block number, tx count, gas used, and **Parallel Score** (red/yellow/green badge)
- Click any card to see detailed block info
- Search bar: enter block number or transaction hash

### 3. Block Detail (`/explorer/[block]`)
- Block metadata (hash, timestamp, gas, tx count)
- **Score Breakdown**: tx count (40%), gas variance (35%), utilization (25%)
- **TX Heatmap**: grid visualization of gas per transaction
- **Parallel Timeline**: grouped transactions showing which ran concurrently

### 4. Dashboard (`/dashboard`)
- Live TPS, block time, parallel score stats
- Score distribution chart (low/medium/high)
- Monad vs Ethereum side-by-side comparison
- **Wallet Tracker**: paste any address (0x...) and click Analyze

### 5. Documentation (`/docs`)
- What parallel execution means
- How the Parallel Score algorithm works
- Monad testnet connection info

---

## How to Run Locally

```bash
# 1. Go to the web directory
cd web

# 2. Install dependencies (already done)
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Run with Real Data (default)
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```
Connects to `https://testnet-rpc.monad.xyz` for live Monad testnet blocks.

### Run with Demo/Mock Data
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```
Uses 20 pre-generated blocks. Yellow "DEMO MODE" badge appears. Use when RPC is down or for offline demos.

### Enable Wallet Connection
Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com), then:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (ES2020) |
| Styling | Tailwind CSS |
| Blockchain | viem + Wagmi v3 |
| Wallet | RainbowKit |
| Data | TanStack Query (polling/caching) |
| Charts | Tremor |
| Animation | Framer Motion + Three.js shader |
| Deploy | Vercel |

---

## Smart Contracts

Found in `/contracts/src/`:

| Contract | Purpose |
|----------|---------|
| `ParallelBenchmark.sol` | Demonstrates parallel execution with isolated storage slots |
| `TxGenerator.sol` | Generates test transactions with varying gas costs |
| `MonadParallelToken.sol` | ERC20 token with batch transfer for parallel testing |

Compile with Foundry:
```bash
cd contracts
forge build
```

---

## Parallel Score Algorithm

The score (0-100) is **heuristic-based** since Monad RPC doesn't yet expose conflict detection data:

| Component | Weight | What It Measures |
|-----------|--------|-----------------|
| Transaction Count | 40% | More txs = more parallel opportunity |
| Gas Variance | 35% | Diverse gas usage = different tx types running in parallel |
| Block Utilization | 25% | Gas used / gas limit ratio |

- **0-60**: Low parallelism (red)
- **61-80**: Medium parallelism (yellow)
- **81-100**: High parallelism (green)

**Transparency**: The score is an estimate. Methodology is documented and open to improvement as Monad's execution layer exposes more data.

---

## Demo Script (3 Minutes)

1. **0:00** — Open landing page. Show Ethereum vs Monad side-by-side animation. Say: "This tool makes Monad's parallelism visible."
2. **0:30** — Go to Explorer. Show live updating blocks. Click a high-score block.
3. **1:00** — Block detail: show TX Timeline animation and Heatmap.
4. **1:30** — Go to Dashboard. Show Monad vs Ethereum comparison.
5. **2:00** — Wallet Tracker: enter your address, show personal parallel score.
6. **2:30** — Explain: open source, for the Monad ecosystem.

---

## Project Structure

```
web/
├── app/
│   ├── page.tsx                  # Landing + Hero
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Wagmi + RainbowKit
│   ├── globals.css               # Theme + grain texture
│   ├── explorer/
│   │   ├── page.tsx              # Block list grid
│   │   └── [block]/page.tsx      # Block detail
│   ├── dashboard/page.tsx        # Dashboard + Wallet Tracker
│   └── docs/page.tsx             # Documentation
├── components/
│   ├── Navigation.tsx            # Header + nav
│   ├── HeroAnimation.tsx         # Ethereum vs Monad animation
│   ├── WalletTracker.tsx         # Address analysis
│   ├── DemoBadge.tsx             # Demo mode indicator
│   ├── NetworkUnavailable.tsx    # Error state
│   ├── blocks/
│   │   ├── BlockCard.tsx         # Block card component
│   │   ├── TxTimeline.tsx        # Parallel execution timeline
│   │   └── TxHeatmap.tsx         # Gas usage heatmap
│   └── ui/
│       ├── shader-animation.tsx  # Three.js WebGL background
│       └── Skeleton.tsx          # Loading skeletons
├── config/index.ts               # RainbowKit + Wagmi config
├── lib/
│   ├── monad.ts                  # viem client + blockchain functions
│   ├── parallelScore.ts          # Score algorithm
│   └── mockData.ts               # 20 pre-generated blocks
└── hooks/
    ├── useLatestBlocks.ts        # TanStack query for blocks
    └── useBlockDetail.ts         # TanStack query for block detail
```

---

## Monad Testnet Info

| | |
|---|---|
| **RPC** | `https://testnet-rpc.monad.xyz` |
| **Chain ID** | `10143` |
| **Explorer** | `testnet.monadscan.com` |
| **Block Time** | ~0.4s |
| **Faucet** | `faucet.monad.xyz` |

---

*ParaLens — Built for Monad.*
