# Database

SQLite via Prisma ORM.

File: `backend/prisma/db.sqlite` (auto-created on first migration).

Schema: `backend/prisma/schema.prisma`.

## Configuration

- `DATABASE_URL` env var (`file:./prisma/db.sqlite`) — set in `backend/.env`
- Config file: `backend/prisma.config.ts`

## Migrations

Migrations are stored in `backend/prisma/migrations/`. The initial migration (`20260715144824_init`) creates all tables and indexes.

To create a new migration after schema changes:

```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

To apply migrations in production:

```bash
cd backend
npx prisma migrate deploy
```

## Models

### `User`

| Prisma field | Column     | Type    | Constraints     |
|------------- |------------|---------|-----------------|
| `id`         | `id`       | Int     | PK AUTOINCREMENT |
| `userName`   | `user_name`| String  | NOT NULL        |
| `email`      | `email`    | String  | UNIQUE NOT NULL |
| `homePage`   | `home_page`| String? | —               |

### `Comment`

| Prisma field       | Column               | Type      | Constraints                              |
|--------------------|----------------------|-----------|------------------------------------------|
| `id`               | `id`                 | Int       | PK AUTOINCREMENT                         |
| `postId`           | `post_id`            | Int       | NOT NULL                                 |
| `parentCommentId`  | `parent_comment_id`  | Int?      | FK → comment.id ON DELETE CASCADE        |
| `text`             | `text`               | String    | NOT NULL                                 |
| `userEmail`        | `user_email`         | String    | FK → user.email ON DELETE CASCADE        |
| `filePath`         | `file_path`          | String?   | JSON array of paths (e.g. `["uploads/a.txt"]`) |
| `createdAt`        | `created_at`         | DateTime  | DEFAULT now()                            |

### `File`

| Prisma field | Column      | Type      | Constraints          |
|------------- |-------------|-----------|----------------------|
| `id`         | `id`        | Int       | PK AUTOINCREMENT     |
| `path`       | `path`      | String    | UNIQUE NOT NULL      |
| `status`     | `status`    | String    | NOT NULL DEFAULT 'pending' |
| `createdAt`  | `created_at`| DateTime  | DEFAULT now()         |

## Indexes

| Index                    | Table   | Column              |
|--------------------------|---------|---------------------|
| `comment_parent_comment_id_idx` | comment | parent_comment_id |
| `comment_user_email_idx`        | comment | user_email        |
| `comment_post_id_idx`           | comment | post_id           |
| `file_status_idx`               | file    | status            |
| `file_created_at_idx`           | file    | created_at        |

## Relations

- `comment.parentCommentId` → `comment.id` (self-referencing, cascade delete)
- `comment.userEmail` → `user.email` (cascade delete)
- `file.status`: `pending` → `published` when a comment referencing the file is created (updated in `OrchestratorService`)
- Files are uploaded to `.tmp/` directory first, then copied to `uploads/` inside the transaction. `FileCleanupService` removes orphaned `.tmp/` and `uploads/` files with `pending` status older than threshold.

## Service

`PrismaService` (`backend/src/prisma/prisma.service.ts`) wraps `PrismaClient` with the `better-sqlite3` adapter and connects on module init.
