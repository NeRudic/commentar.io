# Development

## Commands

All commands run from the package directory (`cd backend` or `cd frontend`).

### Backend

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Watch mode (port 3000) |
| `npm run build` | Compile to dist/ |
| `npm run lint` | ESLint —fix |
| `npm run format` | Prettier |
| `npm run test` | Jest |
| `npm run seed` | Seed DB with test data (--clear to reset) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npx prisma migrate dev` | Create/apply migration |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`)
- **No Co-Authored-By / Signed-off-by**
- **CSS:** CSS Modules (`*.module.css`)
- **Forms:** react-hook-form + valibot
- **Prettier:** single quotes, trailing commas, 80 width, 2-space tabs
- **ESLint:** `endOfLine: "auto"` (Windows-safe)
- **React 19 `setState` in effects:** Don't call `setState` synchronously inside `useEffect`. Derive from props during render instead; for async effects, only set state in `.then()`/`.catch()` callbacks. See `Lightbox.tsx` for examples.
- **No comments** in code unless explicitly requested
- Update `.md` files and `docs/DECISIONS.md` after structural changes

## Database

SQLite file — `backend/prisma/db.sqlite` (configured via `DATABASE_URL` in `.env`). Always run backend commands from `backend/`. Schema is managed via Prisma migrations; run `npx prisma migrate dev` after schema changes. Prisma client is auto-generated on `postinstall` and can be regenerated with `npm run prisma:generate`.

## Build and lint

Before commit:
1. `npm run lint` in both packages
2. `npm run build` in frontend (checks tsc + vite)
3. `npm run format` in backend

## OpenCode / AI agents

- `AGENTS.md` — main agent instructions
- `CLAUDE.md` — project rules and conventions
- `docs/DECISIONS.md` — architectural decisions log
- `docs/OPENCODE.md` — OpenCode tool reference
- `docs/SPEC_COMMENTS.md` — feature specification
