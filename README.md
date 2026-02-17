# BeaverHacks Monorepo

Hackathon management platform for Oregon State University's Hackathon Club. Built as a Turborepo monorepo with Next.js.

## Apps

| App           | Port | Description                             |
| ------------- | ---- | --------------------------------------- |
| `beaverhacks` | 3000 | Main site — event info and applications |
| `shop`        | 3001 | Merchandise store                       |
| `judge`       | 3002 | Judging and project submissions         |
| `career`      | 3003 | Sponsorship management                  |
| `admin`       | 3004 | Admin dashboard                         |

## Shared Packages

- `@repo/ui` — Shared component library (shadcn/ui)
- `@repo/auth` — Authentication (Better Auth)
- `@repo/database` — Prisma schema and client
- `@repo/storage` — Blob Storage

## Getting Started

### Prerequisites

- Node.js (LTS)
- pnpm

### Setup

```bash
git clone https://github.com/OregonStateHackathonClub/website.git
cd website
pnpm install
cp .env.example .env.local
```

Ask a team lead for the `.env.local` credentials.

### Run

```bash
# Run all apps
pnpm dev

# Run a single app
pnpm --filter judge dev
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Database:** PostgreSQL + Prisma
- **Auth:** Better Auth
- **Monorepo:** Turborepo + pnpm
