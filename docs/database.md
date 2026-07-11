# База данных

SQLite3, без ORM — сырые запросы через `DB` сервис (`backend/src/db/db.service.ts`).

Файл: `backend/src/db/db.sqlite` (автосоздаётся при старте).

PRAGMA: `foreign_keys = ON`, `journal_mode = WAL`, `busy_timeout = 5000`.

## Таблицы

### `user`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `user_name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL UNIQUE |
| `home_page` | TEXT | — |

### `comment`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `post_id` | INTEGER | NOT NULL |
| `parent_comment_id` | INTEGER | REFERENCES comment(id) ON DELETE CASCADE |
| `text` | TEXT | NOT NULL |
| `user_email` | TEXT | NOT NULL REFERENCES user(email) ON DELETE CASCADE |
| `file_path` | TEXT | — |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### `file`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `path` | TEXT | NOT NULL UNIQUE |
| `status` | TEXT | NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'published')) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## Индексы

| Индекс | Таблица | Колонка |
|--------|---------|---------|
| `idx_parent_comments` | comment | parent_comment_id |
| `idx_comment_email` | comment | user_email |
| `idx_comment_post_id` | comment | post_id |
| `idx_file_status` | file | status |
| `idx_file_created_at` | file | created_at |

## Связи

- `comment.parent_comment_id` → `comment.id` (самоссылка, каскадное удаление)
- `comment.user_email` → `user.email` (каскадное удаление)
- `file.status`: `pending` → `published` при создании комментария (обновляется в `CommentService` и `OrchestratorService`)
