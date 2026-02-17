# BeaverHacks Monorepo

Hackathon management monorepo for Oregon State University's Hackathon Club.

## Apps

- `beaverhacks` - Main site, applications (port 3000)
- `judge` - Judging & submissions (port 3002)
- `admin` - Admin dashboard (port 3004)
- `shop` - Merchandise (port 3001)
- `career` - Sponsorships (port 3003)

## Code Conventions

### General

- Server components by default, `"use client"` only when needed
- Use `@repo/ui`, `@repo/auth`, `@repo/database` for shared code
- Reference implementation: **apps/admin** is the gold standard

### Server Actions

- Use server actions for all mutations, not API routes
- Exception: Binary file downloads, external service redirects (Stripe)
- Every action starts with auth check (e.g., `await requireAdmin()`)
- Return `{ success: true }` or `{ success: false, error: string }`
- Call `revalidatePath()` after mutations

### Prisma

- Always use `select` to limit fields returned
- Use `_count` for statistics instead of fetching full records
- Parallel queries with `Promise.all()` where possible

### Route Protection

- Use `(authenticated)` route group with auth check in layout
- Redirect unauthenticated users to login with `callbackURL`
- Add self-protection for destructive actions (can't delete own account)

### Git

- Commit messages: short, one-line, no "Co-Authored-By"
- Prefixes: `feat:`, `fix:`, `chore:`, `refactor:`

### Branch Naming

- Format: `<app>/<type>/<description>` — e.g. `judge/feat/project-redesign`
- Apps: `beaverhacks`, `judge`, `admin`, `shop`, `career`
- For shared/cross-app changes: `shared/<type>/<description>`
- Types: `feat`, `fix`, `chore`, `refactor`

## Auth

- Centralized login at `beaverhacks.org/login`
- Cross-app auth uses `callbackURL` query param
- Check session with `auth.api.getSession({ headers: await headers() })`

## Working with Claude

### Preferences

- Be concise
- Ask if requirements are unclear rather than guessing
- Send screenshots when UI looks wrong

### For large features

- Use plan mode first
- Scaffold pages as empty shells before implementing

### For UI work

- Reference existing components, don't invent new styles
- Use @repo/ui components when possible
- Design reference: admin app (dark theme, neutral colors, sharp corners)

### Don't

- Add features beyond what's asked
- Create documentation files unless asked
- Add comments to unchanged code
- Over-engineer
