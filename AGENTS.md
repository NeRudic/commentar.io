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

- `SanitizePipe` strips all HTML except `<strong>`, `<i>`, `<code>`.
- DTOs use `class-validator` + `class-transformer` (`@Type`, `@Transform`) for coercion.

### Frontend types

- Локальные типы в `frontend/src/types/` (разделены на `comment.ts`, `user.ts`, `captcha.ts`, barrel-реэкспорт через `index.ts`).
- `CommentRow` включает JOIN-поля `user_name` и `home_page`.
- Бэкенд импортирует свои DTO из `class-validator`.

### Frontend services

Сервисы используют **axios** (`frontend/package.json`).

## Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`).
- **No `Co-Authored-By` / `Signed-off-by`** trailers in commits.
- **CSS**: CSS Modules (`*.module.css`).
- **Forms**: react-hook-form + valibot (validation).
- **Prettier**: single quotes, trailing commas, 80 width, 2-space tabs.
- **ESLint prettier rule** uses `endOfLine: "auto"` (Windows-safe).
- **No comments** in code unless explicitly requested.
- After any structural change, update relevant `.md` files and `DECISIONS.md`.

## Files the agent should know about

- `docs/` — project documentation (architecture, api, database, deployment, development)
- `README.md` — project overview and quick start
- `DECISIONS.md` — architectural decisions log
- `CLAUDE.md` — project rules and conventions
- `OPENCODE.md` — OpenCode tool navigation reference
- `.env` — `PORT=3000` (backend only)
- `.prettierrc` — formatting config (backend only, frontend has none)
