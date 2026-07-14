# API

Base URL: `http://localhost:3000`

## Captcha

### `GET /captcha`

Generates a math captcha (a + b = ?).

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "a": 7,
  "b": 3
}
```

JWT token — signed with `CAPTCHA_SECRET`, expires in 5 minutes, contains the correct answer.

### `POST /captcha/verify`

Verification (not used directly — verification happens via middleware).

**Body:**

```json
{
  "captcha_token": "eyJhbGciOiJIUzI1NiIs...",
  "captcha_answer": "10"
}
```

**On error (400):**

```json
{
  "expired": false,
  "new_captcha": { "token": "...", "a": 5, "b": 4 },
  "error_message": "Invalid captcha answer"
}
```

## User

### `POST /users`

Create or find user (upsert by email).

**Body:**

```json
{
  "user_name": "John",
  "user_email": "john@example.com",
  "home_page": "https://example.com"
}
```

**Response (201):**

```json
{
  "id": 1,
  "user_name": "John",
  "email": "john@example.com",
  "home_page": "https://example.com"
}
```

## Comment + user (transaction)

### `POST /comment-and-user`

Creates user (findOrCreate) and comment in a single transaction. CaptchaMiddleware validates captcha before calling the controller.

**Body:**

```json
{
  "user_name": "John",
  "user_email": "john@example.com",
  "home_page": "https://example.com",
  "post_id": 1,
  "parent_comment_id": null,
  "text": "<strong>Hello!</strong>",
  "file_path": "uploads/file.txt",
  "captcha_token": "eyJhbGciOiJIUzI1NiIs...",
  "captcha_answer": "10"
}
```

**Response (201):**

```json
{
  "comment": {
    "id": 42,
    "post_id": 1,
    "parent_comment_id": null,
    "user_name": "John",
    "user_email": "john@example.com",
    "home_page": "https://example.com",
    "text": "<strong>Hello!</strong>",
    "file_path": "uploads/file.txt",
    "created_at": "2026-07-11 12:00:00",
    "reply_count": 0
  },
  "siblings": [...]
}
```

## Comments

### `GET /comments/:postId?limit=25&offset=0`

Root comments for a post (parent_comment_id IS NULL).

**Parameters:** `post_id` (path), `limit`, `offset` (query, defaults 25/0).

**Response (200):**

```json
[
  {
    "id": 42,
    "post_id": 1,
    "parent_comment_id": null,
    "user_name": "John",
    "user_email": "john@example.com",
    "home_page": "https://example.com",
    "text": "Comment text",
    "file_path": null,
    "created_at": "2026-07-11 12:00:00",
    "reply_count": 3
  }
]
```

### `GET /comments/:parentCommentId/replies?limit=25&offset=0`

Replies to a specific comment.

### `DELETE /comments/:commentId`

Delete a comment (cascades to child comments).

**Response (200):** `true`

**On not found:** `404`

## Files

### `POST /file-manager/verify`

File upload (multipart/form-data). Accepts: txt (up to 100 KB), jpg/gif/png (resized to 320×240).

File is stored in `.tmp/` with `status = 'pending'` until a comment references it. On comment creation, it's copied to `uploads/` and status changes to `'published'`.

**Field:** `file` (file)

**Response (201):**

```json
{
  "file_id": 1,
  "path": "uploads/abc123.txt"
}
```
