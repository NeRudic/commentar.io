# AGENTS.md — comentar.io

## Workspace layout

No root `package.json` — each package is independent:

| Package | Directory | Tech |
|---------|-----------|------|
| backend | `backend/` | NestJS 11, TS 5.7, sqlite3, class-validator |
| frontend | `frontend/` | React 19, Vite 8, TS 6.0, CSS Modules |
| shared types | `shared/` | API contracts, re-exported via `@shared` alias |

## Commands (all run from package subdirectory)

**Backend** (`cd backend`):
```
npm run start:dev     # watch mode (port 3000)
npm run lint          # eslint --fix
npm run format        # prettier
npm run test          # jest (no specs written yet)
```

**Frontend** (`cd frontend`):
```
npm run dev           # vite dev server
npm run build         # tsc -b && vite build
npm run lint          # eslint
```

## Key architecture notes

### DB
- SQLite file: `backend/src/db/db.sqlite` (auto-created on startup).
- **The path `db.sqlite` resolves from CWD** — always run backend commands from `backend/`.
- Tables auto-created via `db.config.ts:initSQL` on app bootstrap in `db.module.ts`.
- No ORM — raw `sqlite3` queries wrapped in `DB` service (`db.service.ts`).

### Module registration gotcha
`CommentModule` (`backend/src/comment/comment.module.ts`) exists but is **NOT imported** in `AppModule`. The `/comments` endpoints will 404 unless it's added to `app.module.ts` imports.

### Global pipes (order matters)
In `main.ts`: `SanitizePipe` runs first, then `ValidationPipe({ transform: true })`.
- `SanitizePipe` strips all HTML except `<strong>`, `<i>`, `<code>`.
- DTOs use `class-validator` + `class-transformer` (`@Type`, `@Transform`) for coercion.

### Shared types
- Source: `shared/api/types/index.ts`
- Backend tsconfig path: `@shared/*` → `../shared/*`
- Frontend: vite alias `@shared` → `../shared` + tsconfig path in `tsconfig.app.json`
- Frontend uses `verbatimModuleSyntax: true` — import types with `import type { ... }`.

### Frontend services
Despite DECISIONS.md claiming native `fetch`, the codebase actually uses **axios** (`frontend/package.json`, `services/getComments.ts`). DECISIONS.md is outdated.

## Conventions
- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`).
- **No `Co-Authored-By` / `Signed-off-by`** trailers in commits.
- **CSS**: CSS Modules (`*.module.css`).
- **Forms**: @tanstack/react-form + valibot.
- **Prettier**: single quotes, trailing commas, 80 width, 2-space tabs.
- **ESLint prettier rule** uses `endOfLine: "auto"` (Windows-safe).
- **No comments** in code unless explicitly requested.
- After any structural change, update relevant `.md` files and `DECISIONS.md`.

## Files the agent should know about
- `DECISIONS.md` — architectural decisions log
- `CLAUDE.md` — project rules and conventions
- `OPENCODE.md` — OpenCode tool navigation reference
- `.env` — `PORT=3000` (backend only)
- `.prettierrc` — formatting config (backend only, frontend has none)
