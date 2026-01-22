# BeaverHacks Monorepo

Hackathon management monorepo for Oregon State University's Hackathon Club.

## Apps

- `beaverhacks` - Main site, applications (port 3000)
- `judge` - Judging & submissions (port 3002)
- `admin` - Admin dashboard (port 3004)
- `shop` - Merchandise (port 3001)
- `career` - Sponsorships (port 3003)

## Code Conventions

- Server components by default, `"use client"` only when needed
- Server actions for mutations, not API routes
- Return `{ success: true }` or `{ success: false, error: string }` from actions
- Use `@repo/ui`, `@repo/auth`, `@repo/database` for shared code
- Prisma queries: use `select` to limit fields when possible

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
