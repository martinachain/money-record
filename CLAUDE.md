# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

极简记账 (Money Record) - A personal expense tracking PWA with budget management and analytics.

## Development Commands

```bash
npm run dev      # Start Vite dev server (frontend only)
npm run server   # Start local Express server (for local development)
npm run build    # Generate Prisma client and build for production
npm run lint     # Run ESLint
npm run seed     # Seed database with initial categories
npm run test     # Run tests with Vitest
```

## Database Commands

```bash
npx prisma db push        # Push schema to database (preferred for Vercel/Neon)
npx prisma generate       # Regenerate Prisma Client
npx prisma studio         # Open database GUI
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Database**: PostgreSQL (Neon) with Prisma 7
- **Charts**: Recharts
- **Deployment**: Vercel Serverless Functions
- **PWA**: Service Worker + manifest.json

## Architecture

### Vercel Serverless API (`/api`)
- `_db.ts` - Prisma client with `@prisma/adapter-pg` for PostgreSQL
- `transactions.ts` - GET/POST/DELETE transactions
- `categories.ts` - GET/POST categories
- `budgets/index.ts` - GET/POST budgets
- `analytics/*.ts` - Analytics endpoints (summary, trends, category-spending)

API files require `.js` extensions on relative imports (TypeScript moduleResolution requirement).

### Frontend Components (`/src/components`)
- `TransactionForm.tsx` - Add income/expense records
- `BudgetSettings.tsx` - Monthly budget configuration per category
- `BudgetDashboard.tsx` - Budget progress visualization
- `Analytics.tsx` - Charts and spending analysis

### PWA Support (`/public`)
- `sw.js` - Service Worker (caches static assets, skips API requests)
- `manifest.json` - PWA manifest for installable app

## Environment Variables

```
DATABASE_URL or POSTGRES_PRISMA_URL - PostgreSQL connection string
```

## Notes

- Prisma 7 uses adapter pattern - see `api/_db.ts` for PostgreSQL adapter setup
- Service Worker skips caching for non-GET requests and `/api/` paths
- Frontend API calls use `API_BASE_URL` from `src/config.ts`
