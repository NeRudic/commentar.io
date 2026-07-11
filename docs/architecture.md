# Архитектура

## Обзор

Проект состоит из двух независимых пакетов без монорепозитория:

| Пакет | Путь | Стек | Порт |
|-------|------|------|------|
| Бэкенд | `backend/` | NestJS 11, TypeScript, SQLite3, class-validator | 3000 |
| Фронтенд | `frontend/` | React 19, Vite 8, TypeScript 6, CSS Modules | 5173 |

Общих типов нет — каждый пакет имеет свои DTO/типы (см. DECISIONS.md, решения от 2026-06-30 и 2026-07-08).

## Бэкенд (NestJS)

### Модули

```
AppModule
├── DBModule          — sqlite3, автозапуск DDL
├── UserModule        — UserService.findOrCreate (upsert по email)
├── CommentModule     — CRUD комментариев (вложенные, пагинация)
├── CaptchaModule     — JWT-капча (a + b = ?)
├── FileUploadModule  — загрузка файлов (txt/jpg/gif/png)
└── OrchestratorModule — POST /comment-and-user (транзакция, captcha-middleware)
```

### Graph зависимостей

```
DB ──> UserService ──> OrchestratorService
DB ──> CommentService
DB ──> FileUploadService
CaptchaService ──> CaptchaMiddleware
```

### Global pipes (порядок важен)

1. `SanitizePipe` — вырезает HTML, кроме `<strong>`, `<i>`, `<code>`, `<a href title>`
2. `ValidationPipe({ transform: true })` — class-validator + class-transformer

### Middleware

`CaptchaMiddleware` применяется к `POST /comment-and-user` — проверяет капчу, извлекает поля `captcha_token`/`captcha_answer` из тела.

## Фронтенд (React SPA)

### Компоненты

```
App
└── Blog
    └── Post (×N)
        └── CommentSection
            ├── Comment (рекурсивно, до depth 4)
            ├── Modal
            │   └── CommentForm
            │       └── TextEditor
            └── Button
```

Маршрутизации нет — единственная страница с 3 хардкодными постами.

### Сервисы (axios, BASE_URL = http://localhost:3000)

- `getComments` — GET /comments/:postId
- `getReplies` — GET /comments/:parentId/replies
- `createComment` — POST /comment-and-user
- `getCaptcha` — GET /captcha
- `uploadFile` — POST /file-upload/verify

### Форма и валидация

- react-hook-form + valibot (@hookform/resolvers)
- Капча — математическая (a + b), JWT-токен с ответом

### Поток данных

```
Пользователь → TextEditor → CommentForm → createComment() → POST /comment-and-user
                                                              ↓
                                               CaptchaMiddleware → OrchestratorService → DB
                                                              ↓
                                           user + comment (транзакция)
                                                              ↓
                                               { comment, siblings } → UI
```
