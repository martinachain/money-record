# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Money Record is a personal finance/expense tracking application built with React and TypeScript.

## Development Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Database Commands

```bash
npx prisma migrate dev    # Create and apply migrations
npx prisma generate       # Regenerate Prisma Client
npx prisma studio         # Open database GUI
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin in vite.config.ts)
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization

## Architecture Notes

- Tailwind CSS v4 uses the new `@import "tailwindcss"` syntax in CSS files (no tailwind.config.js needed)
- Prisma Client outputs to `src/generated/prisma` (see prisma/schema.prisma)
- Database connection configured in `prisma.config.ts` and `.env` (DATABASE_URL)
