# Architecture

## Overview

The project consists of two independent packages without a monorepo:

| Package  | Path        | Stack                                           | Port |
| -------- | ----------- | ----------------------------------------------- | ---- |
| Backend  | `backend/`  | NestJS 11, TypeScript, Prisma (SQLite), class-validator | 3000 |
| Frontend | `frontend/` | React 19, Vite 8, TypeScript 6, CSS Modules     | 5173 |

No shared types — each package has its own DTOs/types (see docs/DECISIONS.md, entries from 2026-06-30 and 2026-07-08).

## Backend (NestJS)

### Modules

```
AppModule
├── PrismaModule      — Prisma ORM (SQLite), auto-migrate on startup
├── UserModule        — UserService.findOrCreate (upsert by email)
├── CommentModule     — Comment CRUD (nested, paginated, update, delete with email check)
├── CaptchaModule     — JWT captcha (a + b = ?)
├── FileManagerModule  — File upload (txt/jpg/gif/png), orphaned file cleanup, removeFile
└── OrchestratorModule — POST /comment-and-user (create), PATCH /comment-and-user/:id (update with captcha)
```

### Dependency graph

```
PrismaService ──> UserService ──> OrchestratorService
PrismaService ──> CommentService
PrismaService ──> FileManagerService
PrismaService ──> FileCleanupService  (orphaned file cleanup, setInterval)
CaptchaService ──> CaptchaMiddleware ──> OrchestratorService (on POST only)
CaptchaService ──> OrchestratorService (direct verify on PATCH)
```

### Directories

| Directory  | Served                | Purpose                                   |
| ---------- | --------------------- | ----------------------------------------- |
| `uploads/` | Static (`/uploads/*`) | Published files                           |
| `.tmp/`    | Not served            | Pending files before comment confirmation |

### Global pipes (order matters)

1. `SanitizePipe` — strips HTML except `<strong>`, `<i>`, `<code>`, `<a href title>`
2. `ValidationPipe({ transform: true })` — class-validator + class-transformer

### Middleware

- `CaptchaMiddleware` applied to `POST /comment-and-user` — verifies captcha, extracts `captcha_token`/`captcha_answer` fields from body.
- For `PATCH /comment-and-user/:id`, captcha verification is done directly in `OrchestratorService.updateCommentWithUser()`.

## Frontend (React SPA)

### Components

```
App
└── Blog
    └── Post (×N)
        └── CommentSection
            ├── Comment (recursive, up to depth 4)
            │   └── Edit/Delete buttons
            ├── Modal
            │   ├── CommentForm (create/edit)
            │   │   └── TextEditor
            │   └── Delete confirmation (email input)
            └── Button
```

No routing — single page with 3 hardcoded posts.

### Services (axios, BASE_URL = http://localhost:3000)

- `getRootComments` — GET /comments/:postId
- `getReplies` — GET /comments/:parentId/replies
- `createComment` — POST /comment-and-user
- `updateComment` — PATCH /comment-and-user/:id
- `deleteComment` — DELETE /comments/:id?user_email=xxx
- `getCaptcha` — GET /captcha
- `uploadFile` — POST /file-manager/verify

### Form and validation

- react-hook-form + valibot (@hookform/resolvers)
- Captcha — math (a + b), JWT token with the answer

### Data flow

```
Create:
User → TextEditor → CommentForm → createComment() → POST /comment-and-user
                                                       ↓
                                        CaptchaMiddleware → OrchestratorService → DB
                                                       ↓
                                            user + comment (transaction)
                                                       ↓
                                            { comment, siblings } → UI

Update:
User → TextEditor (pre-filled) → CommentForm (edit mode) → updateComment()
                                                              ↓
                                        PATCH /comment-and-user/:id
                                                              ↓
                                        OrchestratorService (captcha verify + email check)
                                                              ↓
                                        transaction: publish new files, remove old, update text
                                                              ↓
                                        CommentRowDTO → UI (replace in list)

Delete:
User → Delete button → Modal (email input) → deleteComment()
                                                ↓
                                    DELETE /comments/:id?user_email=xxx
                                                ↓
                                    CommentService (email check + cascade delete)
                                                ↓
                                    true → UI (remove from list)
```
