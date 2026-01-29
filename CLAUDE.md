# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL PROJECT RULES

**This is an INDEPENDENT Convex project named `money-manager-backend-04f8b`.**

### 🚫 STRICTLY FORBIDDEN

1. **NEVER deploy this project's code to:**
   - ❌ `time-manager` project
   - ❌ `app` project
   - ❌ Any other project

2. **NEVER modify files from other projects:**
   - ❌ Do not modify `time-manager` project files
   - ❌ Do not modify `app` project files

### ✅ REQUIRED PRACTICES

1. **Convex function modifications:**
   - ✅ Only modify `convex/schema.ts` in this folder
   - ✅ Only modify Convex function files in this project

2. **Deployment commands:**
   - ✅ Before running `npx convex deploy`, MUST verify using `.env.local` in this folder
   - ✅ Verify `CONVEX_DEPLOYMENT` points to `money-manager-backend-04f8b` project
   - ✅ Verify deployment target is `lovable-wildebeest-703` (money-manager production)

### 📋 Pre-Deployment Checklist

Before running ANY Convex deployment command:

1. ✅ Confirm current directory is `/Users/martinachain/Desktop/money record/money-record`
2. ✅ Check `CONVEX_DEPLOYMENT` in `.env.local`
3. ✅ Verify project name contains `money-manager-backend-04f8b`
4. ✅ Verify deployment target is NOT `time-manager` or `app` project
5. ✅ When running `npx convex deploy`, check terminal output for deployment target

## Project Overview

极简记账 (Money Record) - A personal expense tracking PWA with budget management and analytics.

**Convex Project**: `money-manager-backend-04f8b`
**Production Deployment**: `lovable-wildebeest-703`

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
