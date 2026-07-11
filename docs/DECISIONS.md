# DECISIONS.md

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
