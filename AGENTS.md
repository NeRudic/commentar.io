# AGENTS.md — comentar.io

## Workspace layout

No root `package.json` — each package is independent:

| Package  | Directory   | Tech                                        |
| -------- | ----------- | ------------------------------------------- |
| backend  | `backend/`  | NestJS 11, TS 5.7, Prisma (SQLite), class-validator |
| frontend | `frontend/` | React 19, Vite 8, TS 6.0, CSS Modules       |

## Commands (all run from package subdirectory)

**Backend** (`cd backend`):

```
npm run start:dev         # watch mode (port 3000)
npm run lint              # eslint --fix
npm run format            # prettier
npm run seed              # populate DB with 315 test comments (--clear to reset)
npm run prisma:generate   # regenerate Prisma client
npx prisma migrate dev    # create/apply migrations
npm run test              # jest (no specs written yet)
```

**Frontend** (`cd frontend`):

```
npm run dev           # vite dev server
npm run build         # tsc -b && vite build
npm run lint          # eslint
```

## Key architecture notes

### DB

- SQLite file: `backend/prisma/db.sqlite` (configured via `DATABASE_URL` in `.env`).
- **Always run backend commands from `backend/`** so the `DATABASE_URL` relative path resolves correctly.
- Schema managed via Prisma migrations in `backend/prisma/migrations/`.
- Prisma client auto-generated on `postinstall`; regenerate manually with `npm run prisma:generate`.
- `PrismaService` (`backend/src/prisma/prisma.service.ts`) wraps `PrismaClient` with `better-sqlite3` adapter.

### File upload flow (transactional)

```
Upload (POST /file-manager/verify):
  memoryStorage → validate → write .tmp/<filename>
  → INSERT INTO file (path, status='pending')
  → return { file_id, path }

Comment creation (POST /comment-and-user, внутри BEGIN/COMMIT):
  → findOrCreate user
  → INSERT comment
  → COPY .tmp/<f> → uploads/<f>  (до 3 ретраев, copyWithRetry)
  → UPDATE file SET status='published'
  COMMIT
  → DELETE .tmp/<f> (best-effort, cleanup подберёт остатки)
```

- `uploads/` — раздаётся статически через `app.useStaticAssets`
- `.tmp/` — не раздаётся, файлы хранятся до подтверждения комментария
- `FileCleanupService` (`file-manager.cleanup.ts`) — запускается раз в час: чистит `.tmp/` по mtime, orphaned `uploads/` по `file.status='pending'`, и строки `file` с `status='pending'` старше порога
- Пороги: `CLEANUP_THRESHOLD_MS` и `CLEANUP_INTERVAL_MS` в `file-manager.config.ts`

### File structure (backend/src/file-manager/)

```
file-manager.config.ts    — UPLOADS_DIR, TEMP_DIR, FILE_UPLOAD_CONFIG
file-manager.controller.ts — POST /file-manager/verify
file-manager.service.ts    — валидация, запись в .tmp/, INSERT file, publishFile, removeTempFile
file-manager.cleanup.ts    — FileCleanupService (периодическая чистка)
file-manager.module.ts     — модуль, создаёт uploads/ + .tmp/ при старте
```

### Global pipes (order matters)

In `main.ts`: `SanitizePipe` runs first, then `ValidationPipe({ transform: true })`.

- `SanitizePipe` strips all HTML except `<strong>`, `<i>`, `<code>`, `<a>`.
  - **XHTML validation** for the `text` field runs before sanitization (inside `SanitizePipe`): validates tag nesting via a stack parser, escapes bare `<` to `&lt;`.
  - Core logic in `backend/src/common/xhtml.validator.ts` (identical copy on frontend: `frontend/src/utils/validateXHTML.ts`).
- Frontend valibot schema (`frontend/src/schemas/commentForm.schema.ts`) validates XHTML on submit via `v.check()` + `v.transform()` — same logic, immediate feedback.
- DTOs use `class-validator` + `class-transformer` (`@Type`, `@Transform`) for coercion.

### Frontend types

- Types are local in `frontend/src/types/` (split into `comment.ts`, `captcha.ts`, `file.ts`, barrel re-export via `index.ts`).
- `CommentRow` includes JOIN fields `user_name` and `home_page`.
- `UpdateCommentRequest` — type for `PATCH /comment-and-user/:id` request body.
- Backend imports its own DTOs from `class-validator`.

### Frontend hooks

- `frontend/src/hooks/useScrollLock.ts` — shared lock with reference counting for `document.body.style.overflow` (used by Modal and Lightbox simultaneously without conflicts).
- Component-level hooks live in their own `hooks/` subdirectories (e.g., `components/CommentForm/hooks/`, `components/OnlineFooter/hooks/`).

### Frontend CommentForm structure

```
components/CommentForm/
├── index.ts                     # barrel: CommentFormCreate, CommentFormEdit, FileList
├── CommentFormCreate.tsx        # form for new comments and replies (formSchema)
├── CommentFormEdit.tsx          # form for editing comments (editFormSchema)
├── CaptchaSection.tsx           # captcha question/input/error sub-component
├── FileList.tsx                 # shared file list component
├── hooks/
│   ├── useCaptcha.ts            # captcha state + handleSubmitError
│   └── useFileUpload.ts         # file state: select, validate, upload API
└── CommentForm.module.css       # shared styles
```

### Frontend services

Services use **axios** (`frontend/package.json`).

- `getRootComments(postId, limit, offset, sortBy, sortOrder)` — GET /comments/:postId
- `getReplies(parentId)` — GET /comments/:parentId/replies
- `createComment(data)` — POST /comment-and-user (with captcha)
- `updateComment(commentId, data)` — PATCH /comment-and-user/:id (with captcha + email)
- `deleteComment(commentId, userEmail)` — DELETE /comments/:id?user_email=xxx
- `getCaptcha()` — GET /captcha
- `uploadFile(file)` — POST /file-manager/verify

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
