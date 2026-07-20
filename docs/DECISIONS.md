# DECISIONS.md

## 2026-07-20 — Shared tag/attribute config

**Decision:** Extracted `ALLOWED_TAGS` and `ALLOWED_ATTRIBUTES` to `shared/tags.ts` at the project root — single canonical source imported by both frontend (`@shared/tags` alias) and backend (relative import).

**Why:**
- The allowed tags list (`a`, `code`, `i`, `strong`) was duplicated in 4 places: `frontend/src/utils/validateXHTML.ts`, `frontend/src/utils/sanitize.ts`, `backend/src/common/xhtml.validator.ts`, `backend/src/common/sanitize.pipe.ts`.
- Allowed attributes (`href`, `title`) were duplicated in 2 places.
- Manual sync risk — adding a 5th tag could miss one file, causing client/server validation drift.

**What changed:**
- Created `shared/tags.ts` with `ALLOWED_TAGS` and `ALLOWED_ATTRIBUTES` (`as const`).
- Updated all 4 consumers to import from `shared/tags.ts`.
- Frontend: `@shared` alias in `vite.config.ts` and `tsconfig.app.json` paths.
- Backend: relative import, `tsconfig.json` `include` extended to `../shared`.
- Consumers spread readonly arrays where libraries expect mutable (`[...ALLOWED_TAGS]`).

## 2026-07-20 — Frontend hygiene refactoring

**Decision:** Systematic cleanup of dead code, unsafe type assertions, and duplicated logic across the frontend.

**Why:**
- Dead types (`UserRow`, `CreateUserRequest`, `PostData`, `WsOnline`, `CaptchaErrorResponse`) accumulated from earlier architectures — `CommentRow` now includes JOIN fields, no separate user entity exists.
- `useCaptcha` and `useOnlineCount` used `as` casts on external data (axios errors, WebSocket messages) without runtime validation — brittle.
- `CommentSection` had a race condition: stale fetch from previous sort could overwrite new sort's data.
- `Modal` and `Lightbox` directly manipulated `document.body.style.overflow` with no stacking — if both were open, closing one restored scroll.
- Minor issues: array index as React key, duplicate `validateAndEscapeXHTML` calls, inconsistent CSS module usage.

**What changed:**
- Removed dead types: `types/user.ts`, `types/ws_online.ts`, dead exports from `captcha.ts`, `data/posts.tsx`.
- Replaced `as` casts with runtime type guards (`isCaptchaErrorResponse`, JSON shape check).
- Removed dead `AbortController` from `useCaptcha` (`.signal` was never passed to fetch).
- Added `fetchIdRef` generation counter to `CommentSection` to ignore stale fetch results.
- Extracted `useScrollLock` hook with reference counting (handles stacked Modal + Lightbox).
- Replaced `key={i}` with `key={item.name}` in `FileList`.
- Merged `v.check()` + `v.transform()` into single `v.transform()` in valibot schemas.
- Added CSS module classes to `ChevronLeft`/`ChevronRight` icons.
- Removed unused `user_email` prop from `Comment` component.

**Files touched:**
- 16 files across `frontend/src/`.

## 2026-07-20 — Refine CommentForm: extract FileList, add handleSubmitError, Promise.allSettled

**Decision:** Cleaned up CommentForm internals without changing component boundaries:

- Added `FileList.tsx` — shared component for rendering file lists with remove buttons
- Added `AbortController` to `useCaptcha()` — cancels pending fetch on unmount
- Added `handleSubmitError(err)` to `useCaptcha()` — encapsulates the `captcha_error` cast+check pattern that was duplicated in both forms
- `useFileUpload()`: replaced `ALLOWED_TYPES as readonly string[]` cast with `.some()`; switched `Promise.all` to `Promise.allSettled` for partial upload success
- `CaptchaSection.tsx`: added `inputMode="numeric"` for mobile UX

**Why:**
- The catch-block casting + captcha_error check was identical in `CommentFormCreate` and `CommentFormEdit` — DRY violation
- `Promise.all` rejected all files if one failed, losing successful uploads
- No `AbortController` meant potential state-update-after-unmount on a slow captcha fetch
- File list JSX was duplicated across both forms

**Files touched:**
- `frontend/src/components/CommentForm/hooks/useCaptcha.ts`
- `frontend/src/components/CommentForm/hooks/useFileUpload.ts`
- `frontend/src/components/CommentForm/CaptchaSection.tsx`
- `frontend/src/components/CommentForm/FileList.tsx` (new)
- `frontend/src/components/CommentForm/CommentFormCreate.tsx`
- `frontend/src/components/CommentForm/CommentFormEdit.tsx`
- `frontend/src/components/CommentForm/index.ts`

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
- `FileManagerService.processFile()` writes to `.tmp/<filename>`, inserts `file` row with `status = 'pending'`.
- `OrchestratorService.createCommentWithUser()` inside `BEGIN IMMEDIATE … COMMIT`: COPY `.tmp/<f>` → `uploads/<f>` (with up to 3 retries), then `UPDATE file SET status = 'published'`.
- After COMMIT: best-effort `unlink` of `.tmp/<f>`.
- `FileCleanupService` (setInterval, 1h): cleans `.tmp/` (mtime > 1h), orphaned `uploads/` (file.status = 'pending', created_at > 1h), and orphaned rows.
- Config: `TEMP_DIR = '.tmp'`, `CLEANUP_THRESHOLD_MS = 3_600_000`, `RETRY_LIMIT = 3` in `file-manager.config.ts`.

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

## 2026-07-15 — XHTML validation for comment text

**Decision:** Added XHTML structure validation for the `text` field on both frontend and backend. Only whitelisted tags (`a`, `code`, `i`, `strong`) are treated as tags; everything else (unknown tags, bare `<`) is escaped to `&lt;`.

**Why:**
- SPEC пункт 17 requires "closing tag check, must be valid XHTML".
- A separate HTML/XHTML parser library would be overkill for 4 allowed tags.
- Custom stack-based validator avoids extra dependencies and false positives (e.g., `3 < 5` is treated as text).

**How:**
- Created `backend/src/common/xhtml.validator.ts` and `frontend/src/utils/validateXHTML.ts` — identical function: `validateAndEscapeXHTML(input)`.
- **Backend**: Integrated into `SanitizePipe` before `sanitize-html` — validates XHTML structure, then sanitizes. Only the `text` field is validated (other fields skip the check).
- **Frontend**: Added `v.check()` + `v.transform()` to the `text` field in the valibot schema. The check validates structure; the transform escapes bare `<` characters before submission.
- Error messages: specific on mismatch (`Ожидался закрывающий </strong>, но найден </i>`) and on unclosed tags (`Незакрытые теги: <strong>, <i>`).
- Stray closing tags (`</i>` when no opener exists) are escaped as text rather than rejected.

## 2026-07-20 — Update and delete for comments

**Decision:** Added `PATCH /comment-and-user/:id` for updating comments and enhanced `DELETE /comments/:id` with email verification. Frontend adds Edit/Delete buttons per comment with a modal-based UX.

**Why:**
- Project had only create/read; update and delete are standard CRUD operations needed for completeness.
- No authentication system exists, so email ownership verification is the lightest guard.
- Captcha on update prevents automated abuse (same as create).

**How:**
- **Update endpoint** (`PATCH /comment-and-user/:id` in `OrchestratorController`):
  - Accepts `text`, `user_email`, `file_paths`, `captcha_token`, `captcha_answer`.
  - `OrchestratorService.updateCommentWithUser()` verifies captcha directly (not via middleware), then runs a transaction:
    1. Finds comment, checks `user_email` matches (`ForbiddenException` if not).
    2. Computes file diff: publishes new `.tmp/` files, removes deleted `uploads/` files.
    3. Updates `comment.text` and `comment.filePath`.
  - `FileManagerService.removeFile()` — new method, deletes from `uploads/` disk and `file` table.
- **Delete endpoint** (`DELETE /comments/:id?user_email=xxx` in `CommentController`):
  - Optional `user_email` query param for ownership check.
  - `CommentService.deleteComment()` finds comment, compares email if provided.
  - Prisma cascade deletes child comments automatically (`onDelete: Cascade`).
- **Frontend:**
  - `CommentForm` handles both create and edit via the `initialData` prop. In edit mode: hides user fields, shows email input for ownership, pre-fills TextEditor, allows file add/remove, requires captcha.
  - Delete uses a Modal with an email input field (no more `window.prompt`/`window.confirm`).
  - `CommentSection` and `Comment` propagate `onDelete`/`onUpdate` callbacks to update local state without a full refetch.

## 2026-07-20 — Split CommentForm into Create/Edit + extracted hooks

**Decision:** The monolithic `CommentForm.tsx` (333 lines, single component handling both create and edit) was split into:
- `CommentFormCreate.tsx` and `CommentFormEdit.tsx` — separate typed forms with their own schema
- `useCaptcha.ts` and `useFileUpload.ts` — extracted state management hooks
- `CaptchaSection.tsx` — extracted captcha UI sub-component

**Why:**
- Union type `CommentFormValues | EditFormValues` forced `as any` casts on `register()` and `errors` — splitting eliminates the union entirely.
- The old component had two distinct modes (create/edit) with different fields, rules, and submit logic. A single component with `isEdit` branching violated SRP.
- Captcha and file management logic was tightly coupled to the form; extracting hooks makes them reusable and testable.

**How:**
- Created `hooks/useCaptcha.ts` — `{ captcha, captchaAnswer, captchaError, setCaptchaAnswer, refreshCaptcha }`
- Created `hooks/useFileUpload.ts` — `{ selectedFiles, fileErrors, keptFilePaths, fileInputRef, addFiles, removeFile, removeKeptFile, uploadSelected }`
- Created `CaptchaSection.tsx` — presentational component for captcha question/input/error
- Created `index.ts` — barrel re-exporting `CommentFormCreate` and `CommentFormEdit`
- Updated `Comment.tsx` and `CommentSection.tsx` callers to import from new barrel
- Deleted old `CommentForm.tsx`

## 2026-07-15 — Migrated from raw sqlite3 to Prisma ORM

**Decision:** Replaced the custom `DB` service (raw `sqlite3` with callback-based queries) with Prisma ORM (v7) using the `better-sqlite3` adapter.

**Why:**
- Type-safe queries without manual DTO mapping for every result.
- Auto-generated client with full IDE autocompletion.
- Declarative schema (`prisma/schema.prisma`) instead of raw DDL strings in `db.config.ts`.
- Built-in migration system (`prisma migrate`) for schema versioning.
- Transaction API (`$transaction`) with proper TypeScript types instead of manual `BEGIN/COMMIT`.

**What changed:**
- Removed `backend/src/db/` (db.service.ts, db.module.ts, db.config.ts, db.types.ts) and `sqlite3`/`@types/sqlite3` dependencies.
- Added `@prisma/client`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `prisma` (CLI).
- Created `backend/prisma/schema.prisma` with `User`, `Comment`, `File` models.
- Created `backend/prisma.config.ts` for Prisma CLI config.
- Created `backend/src/prisma/` (prisma.service.ts, prisma.module.ts, prisma.types.ts) — `PrismaModule` is `@Global()`.
- Rewrote `UserService`, `CommentService`, `FileManagerService`, `FileCleanupService`, `OrchestratorService`, `seed.ts` to use `PrismaClient` API.
- DB path changed from `backend/db.sqlite` to `backend/prisma/db.sqlite`.
