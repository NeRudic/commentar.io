# API

Базовый URL: `http://localhost:3000`

## Капча

### `GET /captcha`

Генерирует математическую капчу (a + b = ?).

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "a": 7,
  "b": 3
}
```

Токен JWT — подписан `CAPTCHA_SECRET`, срок 5 минут, содержит правильный ответ.

### `POST /captcha/verify`

Проверка (не используется напрямую — проверка через middleware).

**Тело:**
```json
{
  "captcha_token": "eyJhbGciOiJIUzI1NiIs...",
  "captcha_answer": "10"
}
```

**При ошибке (400):**
```json
{
  "expired": false,
  "new_captcha": { "token": "...", "a": 5, "b": 4 },
  "error_message": "Неверный ответ капчи"
}
```

## Пользователь

### `POST /users`

Создать или найти пользователя (upsert по email).

**Тело:**
```json
{
  "user_name": "Иван",
  "user_email": "ivan@example.com",
  "home_page": "https://example.com"
}
```

**Ответ (201):**
```json
{
  "id": 1,
  "user_name": "Иван",
  "email": "ivan@example.com",
  "home_page": "https://example.com"
}
```

## Комментарий + пользователь (транзакция)

### `POST /comment-and-user`

Создаёт пользователя (findOrCreate) и комментарий в одной транзакции. CaptchaMiddleware проверяет капчу перед вызовом контроллера.

**Тело:**
```json
{
  "user_name": "Иван",
  "user_email": "ivan@example.com",
  "home_page": "https://example.com",
  "post_id": 1,
  "parent_comment_id": null,
  "text": "<strong>Привет!</strong>",
  "file_path": "uploads/file.txt",
  "captcha_token": "eyJhbGciOiJIUzI1NiIs...",
  "captcha_answer": "10"
}
```

**Ответ (201):**
```json
{
  "comment": {
    "id": 42,
    "post_id": 1,
    "parent_comment_id": null,
    "user_name": "Иван",
    "user_email": "ivan@example.com",
    "home_page": "https://example.com",
    "text": "<strong>Привет!</strong>",
    "file_path": "uploads/file.txt",
    "created_at": "2026-07-11 12:00:00",
    "reply_count": 0
  },
  "siblings": [...]
}
```

## Комментарии

### `GET /comments/:postId?limit=25&offset=0`

Корневые комментарии поста (parent_comment_id IS NULL).

**Параметры:** `post_id` (path), `limit`, `offset` (query, умолчания 25/0).

**Ответ (200):**
```json
[
  {
    "id": 42,
    "post_id": 1,
    "parent_comment_id": null,
    "user_name": "Иван",
    "user_email": "ivan@example.com",
    "home_page": "https://example.com",
    "text": "Текст",
    "file_path": null,
    "created_at": "2026-07-11 12:00:00",
    "reply_count": 3
  }
]
```

### `GET /comments/:parentCommentId/replies?limit=25&offset=0`

Ответы на конкретный комментарий.

### `DELETE /comments/:commentId`

Удалить комментарий (каскадно — удаляет дочерние).

**Ответ (200):** `true`

**При отсутствии:** `404`

## Файлы

### `POST /file-upload/verify`

Загрузка файла (multipart/form-data). Принимает: txt (до 100 КБ), jpg/gif/png (ресайз до 320×240).

**Поле:** `file` (file)

**Ответ (201):**
```json
{
  "file_id": 1,
  "path": "uploads/abc123.txt"
}
```
