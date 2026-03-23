# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development server with hot reload
yarn dev

# Type check and build for production
yarn build

# Lint code
yarn lint

# Preview production build locally
yarn preview
```

## Project Overview

This is a React + TypeScript + Vite frontend for **StockValueFinder** (价值投资决策看板), a stock analysis dashboard for Chinese markets (A-shares and Hong Kong stocks). The app integrates with a backend API to provide three core analyses:

1. **Risk Analysis** - Beneish M-Score manipulation detection, financial health scoring
2. **Yield Analysis** - Dividend yield vs risk-free benchmark comparison
3. **DCF Valuation** - Dynamic valuation sandbox with interactive parameter adjustment

## Architecture

### Directory Structure

```
src/
├── api/           # API client and type definitions
│   ├── client.ts  # Backend API client with envelope handling
│   └── types.ts   # TypeScript types mirroring backend DTOs
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks (useDashboard)
├── pages/         # Page-level components (Dashboard)
├── App.tsx        # Router configuration
└── main.tsx       # Application entry point
```

### Key Patterns

**API Client Pattern**
- All API responses follow a consistent envelope: `{ success, data, error, meta }`
- Client handles HTTP errors and returns consistent shape
- Base URL configurable via `VITE_API_BASE_URL` env var (default: `http://localhost:8000`)

**Custom Hooks for State Management**
- `useDashboard` is the primary business logic hook
- Manages ticker input, cost basis, and all analysis states
- Orchestrates parallel API calls for risk, yield, and DCF analysis
- Debounced DCF parameter updates via `refreshDcf` callback

**Component Architecture**
- Components receive data as props, handle UI concerns only
- No API calls or complex state management in components
- Radix UI primitives for accessible interactive components
- Recharts for data visualization

## Backend Integration

The frontend integrates with a Python backend (stockvalue_backend) at `/api/v1/analyze/`:

- **POST /api/v1/analyze/risk/** - Risk analysis with M-Score
- **POST /api/v1/analyze/yield/** - Yield gap analysis
- **POST /api/v1/analyze/dcf/** - DCF valuation with configurable parameters

All types in `src/api/types.ts` mirror backend Pydantic models to ensure type safety.

## Important Constraints

**Ticker Format**
Stock tickers must follow pattern: `^\d{6}\.(SH|SZ|HK)$`
- A-shares: `600519.SH`, `000002.SZ`
- Hong Kong: `0700.HK`

**DCF Parameter Updates**
- Use 400ms debounce for slider changes (ValuationSandbox)
- Merge partial params with existing valuation.dcf_params
- Default DCF params defined in `useDashboard` hook

**Yield Analysis Context**
- HK stocks support two tax contexts: `stock_connect` (20% tax) vs `native` (no tax)
- A-shares always use net dividend yield
- Benchmark rates: 3y deposit, 5y deposit, 10y bond

## Development Notes

- No test infrastructure is currently configured
- ESLint uses flat config with React Hooks and React Refresh plugins
- TypeScript project references: `tsconfig.app.json` for app code, `tsconfig.node.json` for build scripts
- Vite build runs `tsc -b` before bundling for type safety

## Environment Variables

Required in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```
