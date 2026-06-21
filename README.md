# Budget Meal Planner

Monorepo for a budget-aware meal planning application.

## Structure

```
├── frontend/     React + Vite + Tailwind CSS
├── backend/      Express API (proxy for external services)
└── package.json  npm workspaces root
```

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
```

## Development

Run both frontend and backend:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001

Run individually:

```bash
npm run dev:frontend
npm run dev:backend
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run build` | Build both workspaces |
| `npm run lint` | Lint both workspaces |
| `npm run typecheck` | Type-check both workspaces |

## Design System

Tokens live in `frontend/src/styles/tokens.ts` (reference) and `frontend/src/index.css` (Tailwind `@theme`). Keep both in sync when changing colors, typography, or spacing.
