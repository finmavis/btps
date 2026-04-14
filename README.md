# Batch Transaction Processing System (BTPS)

A full-stack demo app for **batch bank transfers**: list and filter transactions, switch simulated users (Maker / Approver / Viewer), create batches from CSV, and approve or reject pending items.

Built with **React Router 7** (SSR), **React 19**, **Vite**, and **TypeScript**. UI uses **CSS Modules** with Radix UI primitives.

## Documentation

- **[Codebase guide](docs/CODEBASE.md)** — overview, architecture, folder layout, routes, domain model, server stores, and conventions.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` (default Vite port).

### Scripts

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Development server                 |
| `npm run build`     | Production build                   |
| `npm start`         | Run production server              |
| `npm run typecheck` | Type generation + TypeScript check |
| `npm test`          | Vitest                             |
| `npm run lint`      | ESLint                             |

Optional server env vars for seed data: `BTPS_SEED_USERS`, `BTPS_SEED_TRANSACTIONS` (see `docs/CODEBASE.md`).

## Production build

```bash
npm run build
```

Output layout matches the [React Router deployment model](https://reactrouter.com/): client assets and server bundle under `build/`.
