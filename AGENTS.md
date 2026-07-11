# AGENTS.md — comentar.io

## Workspace layout

No root `package.json` — each package is independent:

| Package      | Directory   | Tech                                                   |
| ------------ | ----------- | ------------------------------------------------------ |
| backend      | `backend/`  | NestJS 11, TS 5.7, sqlite3, class-validator            |
| frontend     | `frontend/` | React 19, Vite 8, TS 6.0, CSS Modules                  |

## Commands (all run from package subdirectory)

**Backend** (`cd backend`):

```
npm run start:dev     # watch mode (port 3000)
npm run lint          # eslint --fix
npm run format        # prettier
npm run seed          # populate DB with 315 test comments (--clear to reset)
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

### Global pipes (order matters)

In `main.ts`: `SanitizePipe` runs first, then `ValidationPipe({ transform: true })`.

- `SanitizePipe` strips all HTML except `<strong>`, `<i>`, `<code>`, `<a>`.
- DTOs use `class-validator` + `class-transformer` (`@Type`, `@Transform`) for coercion.

### Frontend types

- Types are local in `frontend/src/types/` (split into `comment.ts`, `user.ts`, `captcha.ts`, barrel re-export via `index.ts`).
- `CommentRow` includes JOIN fields `user_name` and `home_page`.
- Backend imports its own DTOs from `class-validator`.

### Frontend services

Services use **axios** (`frontend/package.json`).

## Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`).
- **No `Co-Authored-By` / `Signed-off-by`** trailers in commits.
- **CSS**: CSS Modules (`*.module.css`).
- **Forms**: react-hook-form + valibot (validation).
- **Prettier**: single quotes, trailing commas, 80 width, 2-space tabs.
- **ESLint prettier rule** uses `endOfLine: "auto"` (Windows-safe).
- **No comments** in code unless explicitly requested.
- **Branching**: work in dedicated branches from `main`. Name them `type/description` (e.g., `feat/comments-pagination`, `fix/empty-submit`).
- After any structural change, update relevant `.md` files and `docs/DECISIONS.md`.

## Files the agent should know about

- `docs/` — project documentation (architecture, api, database, deployment, development, decisions, spec, opencode)
- `README.md` — project overview and quick start
- `AGENTS.md` — agent instructions (this file)
- `CLAUDE.md` — project rules and conventions
- `docs/DECISIONS.md` — architectural decisions log
- `docs/OPENCODE.md` — OpenCode tool navigation reference
- `docs/SPEC_COMMENTS.md` — frontend feature specification
- `.env` — `PORT=3000` (backend only)
- `.prettierrc` — formatting config (backend only, frontend has none)
