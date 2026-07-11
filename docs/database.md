# Database

SQLite3, no ORM — raw queries via `DB` service (`backend/src/db/db.service.ts`).

File: `backend/src/db/db.sqlite` (auto-created on startup).

PRAGMA: `foreign_keys = ON`, `journal_mode = WAL`, `busy_timeout = 5000`.

## Tables

### `user`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `user_name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL UNIQUE |
| `home_page` | TEXT | — |

### `comment`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `post_id` | INTEGER | NOT NULL |
| `parent_comment_id` | INTEGER | REFERENCES comment(id) ON DELETE CASCADE |
| `text` | TEXT | NOT NULL |
| `user_email` | TEXT | NOT NULL REFERENCES user(email) ON DELETE CASCADE |
| `file_path` | TEXT | — |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `file`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `path` | TEXT | NOT NULL UNIQUE |
| `status` | TEXT | NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'published')) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## Indexes

| Index | Table | Column |
|-------|-------|--------|
| `idx_parent_comments` | comment | parent_comment_id |
| `idx_comment_email` | comment | user_email |
| `idx_comment_post_id` | comment | post_id |
| `idx_file_status` | file | status |
| `idx_file_created_at` | file | created_at |

## Relations

- `comment.parent_comment_id` → `comment.id` (self-referencing, cascade delete)
- `comment.user_email` → `user.email` (cascade delete)
- `file.status`: `pending` → `published` when a comment referencing the file is created (updated in `CommentService` and `OrchestratorService`)
