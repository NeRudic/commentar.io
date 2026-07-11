# Architecture

## Overview

The project consists of two independent packages without a monorepo:

| Package | Path | Stack | Port |
|---------|------|-------|------|
| Backend | `backend/` | NestJS 11, TypeScript, SQLite3, class-validator | 3000 |
| Frontend | `frontend/` | React 19, Vite 8, TypeScript 6, CSS Modules | 5173 |

No shared types — each package has its own DTOs/types (see docs/DECISIONS.md, entries from 2026-06-30 and 2026-07-08).

## Backend (NestJS)

### Modules

```
AppModule
├── DBModule          — sqlite3, auto-initialize DDL
├── UserModule        — UserService.findOrCreate (upsert by email)
├── CommentModule     — Comment CRUD (nested, paginated)
├── CaptchaModule     — JWT captcha (a + b = ?)
├── FileUploadModule  — File upload (txt/jpg/gif/png)
└── OrchestratorModule — POST /comment-and-user (transaction, captcha-middleware)
```

### Dependency graph

```
DB ──> UserService ──> OrchestratorService
DB ──> CommentService
DB ──> FileUploadService
CaptchaService ──> CaptchaMiddleware
```

### Global pipes (order matters)

1. `SanitizePipe` — strips HTML except `<strong>`, `<i>`, `<code>`, `<a href title>`
2. `ValidationPipe({ transform: true })` — class-validator + class-transformer

### Middleware

`CaptchaMiddleware` applied to `POST /comment-and-user` — verifies captcha, extracts `captcha_token`/`captcha_answer` fields from body.

## Frontend (React SPA)

### Components

```
App
└── Blog
    └── Post (×N)
        └── CommentSection
            ├── Comment (recursive, up to depth 4)
            ├── Modal
            │   └── CommentForm
            │       └── TextEditor
            └── Button
```

No routing — single page with 3 hardcoded posts.

### Services (axios, BASE_URL = http://localhost:3000)

- `getComments` — GET /comments/:postId
- `getReplies` — GET /comments/:parentId/replies
- `createComment` — POST /comment-and-user
- `getCaptcha` — GET /captcha
- `uploadFile` — POST /file-upload/verify

### Form and validation

- react-hook-form + valibot (@hookform/resolvers)
- Captcha — math (a + b), JWT token with the answer

### Data flow

```
User → TextEditor → CommentForm → createComment() → POST /comment-and-user
                                                       ↓
                                        CaptchaMiddleware → OrchestratorService → DB
                                                       ↓
                                            user + comment (transaction)
                                                       ↓
                                            { comment, siblings } → UI
```
