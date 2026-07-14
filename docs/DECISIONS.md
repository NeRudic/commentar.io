# DECISIONS.md

## 2026-07-11 — Seed script for test data

**Decision:** Created `backend/scripts/seed.ts` — a standalone TypeScript script (no NestJS DI) that populates the database with realistic test data.

**Why:**
- Needed 315 comments across 3 posts with controlled nesting depth to test pagination, nested rendering, and depth edge-cases.
- Raw SQL seed files are fragile (autoincrement IDs make parent references unpredictable).
- A NestJS command module (`@nestjs/console`) would add an unnecessary dependency for a one-off script.
- Direct `sqlite3` usage in a standalone script reuses the existing dependency and tsconfig.

**How:**
- `npm run seed` (run from `backend/`) — appends data without clearing.
- `npm run seed -- --clear` — deletes all existing data first, then inserts fresh.
- Distribution per post: 35 root → 15 depth-1 → 12 depth-2 → 8 depth-3 → 30 depth-4 → 5 depth-5+.
- 5 users inserted via `INSERT OR IGNORE` (idempotent).
- Themed root texts per post (neural networks, diffusion, RL); generic reply texts for deeper levels.
- Timestamps spread across the last 168 hours for realistic date ordering.

## 2026-06-22 — Shared API types at root, fetch-based services (REVISED)

**Decision:** Shared backend-contract types extracted to root `shared/api/types/`.
Frontend services built on native `fetch` (no axios or other HTTP library).

**Why:**
- Types should be a single source of truth for both parts of the project.
- Native `fetch` — zero dependency, built into all modern browsers.
- A small application does not need an axios abstraction layer.

**How it was wired:**
- `@shared` alias configured in `vite.config.ts` (resolve.alias) and `tsconfig.app.json` (paths).
- Services imported via `import type { ... } from '@shared/api/types'`.

## 2026-06-30 — Abandoned shared types, switched to axios

**Decision:** Types moved locally to `frontend/src/types/` (split into `comment.ts`, `user.ts`, `captcha.ts` with barrel re-export via `index.ts`).
Services rewritten from `fetch` to `axios` (`^1.18.1`).

**Why:**
- Shared types became inconvenient when backend/frontend representations diverged (JOIN fields).
- `axios` — more convenient API, automatic JSON parsing, interceptors.
- Local types are easier to maintain iteratively, without cross-package synchronization.

**What changed:**
- `@tanstack/react-form` and `@tanstack/valibot-form-adapter` removed.
- `FormField` wrapper component removed — `register()` is self-sufficient.
- Validation (valibot) connected via `@hookform/resolvers/valibot`.

## 2026-06-30 — Abandoned @tanstack/react-form, switched to react-hook-form

**Decision:** Replaced `@tanstack/react-form` (^1.33.0) with `react-hook-form` for CommentForm.

**Why:**
- `@tanstack/react-form` v1.33 has 22 generic parameters, making reusable wrappers impossible without `any`.
- Boilerplate: `form.Field` + `form.Subscribe` creates ~15 lines per field vs 1 line of `register()` in RHF.
- RHF is a mature library, 1 generic (`useForm<T>()`), built-in `isSubmitting`, `errors`, `register`.

**What changed:**
- `@tanstack/react-form` and `@tanstack/valibot-form-adapter` removed.
- `FormField` wrapper component removed — `register()` is self-sufficient.
- Validation (valibot) connected via `@hookform/resolvers/valibot` or manually in `register` options.

## 2026-07-14 — Transactional file upload with .tmp staging

**Decision:** File uploads are first written to a `.tmp/` directory with `status = 'pending'`. Files are copied to `uploads/` only inside the comment-creation transaction, after the user and comment rows are successfully inserted.

**Why:**
- Previously, files were written to `uploads/` immediately on upload, before the transaction started. If the transaction failed, orphaned files remained in `uploads/` with `status = 'pending'`.
- New approach: files stay in `.tmp/` until the transaction confirms. COPY (not MOVE) preserves the original in `.tmp/` for retry on failure.
- A `FileCleanupService` runs hourly: deletes `.tmp/` files by mtime, removes orphaned `uploads/` files with `status = 'pending'` older than threshold, and purges stale `file` rows.

**How:**
- `FileUploadService.processFile()` writes to `.tmp/<filename>`, inserts `file` row with `status = 'pending'`.
- `OrchestratorService.createCommentWithUser()` inside `BEGIN IMMEDIATE … COMMIT`: COPY `.tmp/<f>` → `uploads/<f>` (with up to 3 retries), then `UPDATE file SET status = 'published'`.
- After COMMIT: best-effort `unlink` of `.tmp/<f>`.
- `FileCleanupService` (setInterval, 1h): cleans `.tmp/` (mtime > 1h), orphaned `uploads/` (file.status = 'pending', created_at > 1h), and orphaned rows.
- Config: `TEMP_DIR = '.tmp'`, `CLEANUP_THRESHOLD_MS = 3_600_000`, `RETRY_LIMIT = 3` in `file-upload.config.ts`.

## 2026-07-11 — Root comment sorting on backend with white list

**Decision:** Sorting of root comments is done on the backend via SQL `ORDER BY`, not on the frontend.

**Why:**
- Pagination (`LIMIT/OFFSET`) and sorting are coupled — sorting must happen before pagination to be correct across pages.
- Frontend-only sorting would only order the current 25-comment page, giving wrong results after "Show more".

**How:**
- Backend accepts `sort_by` and `sort_order` query params in `GET /comments/:post_id`.
- White list validation via `@IsIn()` decorator in the DTO. Invalid values are rejected by the ValidationPipe with 400. The service only sets defaults for missing values.
- `user_name` and `email` use `COLLATE NOCASE` for case-insensitive ordering.
- Frontend shows three sort buttons (User Name, E-mail, Date) above the comment list.
- Clicking a new field sorts ascending; clicking the same field toggles direction.
- Changing sort resets the local state (clears loaded comments) and triggers a fresh fetch from offset 0.

## 2026-07-08 — Complete removal of shared/api/types

**Decision:** Removed `shared/` directory and all `@shared` aliases from tsconfig/vite.
`svelte/UserRow` moved to `backend/src/user/user.types.ts`.

**Why:**
- Frontend has been using local types (`frontend/src/types/`) for a long time.
- Backend uses DTOs with `class-validator`, the only shared consumer was `UserRow` in `UserService`.
- `@shared` aliases in tsconfig/vite were dead config.

**What changed:**
- Created `backend/src/user/user.types.ts` with `UserRow`.
- `user.service.ts` imports `UserRow` locally.
- Removed `@shared` aliases from `backend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/vite.config.ts`.
- `shared/` directory deleted.
