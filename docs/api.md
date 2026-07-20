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

### `PATCH /comment-and-user/:commentId`

Update a comment (text and/or files). Requires captcha and email ownership verification.

**Body:**

```json
{
  "text": "<strong>Updated text</strong>",
  "user_email": "john@example.com",
  "file_paths": ["uploads/abc123.txt"],
  "captcha_token": "eyJhbGciOiJIUzI1NiIs...",
  "captcha_answer": "10"
}
```

**Response (200):** `CommentRowDTO` (same shape as comment object in create response)

**On error (400):** captcha error (same format as create)

**On error (403):** email does not match comment owner

### `DELETE /comments/:commentId?user_email=xxx`

Delete a comment (cascades to child comments). Requires email verification via query param.

**Query params:**

| Param        | Type   | Required | Description                        |
| ------------ | ------ | -------- | ---------------------------------- |
| `user_email` | string | no*      | Owner's email for ownership check  |

*If `user_email` is provided, the backend verifies it matches the comment owner. If omitted, the comment is deleted without verification (admin use).

**Response (200):** `true`

**On not found:** `404`

**On error (403):** email does not match comment owner

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
