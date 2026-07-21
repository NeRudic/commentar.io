# Deployment

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | SQLite database path | `file:./prisma/db.sqlite` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:5173` |
| `CAPTCHA_SECRET` | Secret for JWT captcha | `random-256-bit-string` |

### Frontend

No env vars used. Backend URL is configured in `frontend/src/services/index.ts` via `VITE_API_URL` env var, falling back to `http://localhost:3000`.

## Build

### Backend

```bash
cd backend
npm install           # also runs prisma generate
npx prisma migrate deploy  # apply migrations
npm run build         # → dist/
npm run start:prod    # node dist/main
```

### Frontend

```bash
cd frontend
npm install
npm run build        # → dist/ (static site)
```

## Production

### Option: Docker

```bash
# build and start
docker compose up --build -d
```

Container serves both the API and the pre-built frontend SPA on port 3000.

**Volumes:**

| Volume | Mount point | Purpose |
|--------|-------------|---------|
| `sqlite_data` | `/app/backend/prisma` | SQLite database file (persists across restarts) |
| `uploads_data` | `/app/backend/uploads` | Published file attachments |
| `tmp_data` | `/app/backend/.tmp` | Pending files before comment confirmation |

**Environment variables:**

| Variable | Set in | Notes |
|----------|--------|-------|
| `PORT` | `dockerfile` | `3000` |
| `DATABASE_URL` | `dockerfile` | `file:./prisma/db.sqlite` |
| `CORS_ORIGIN` | `dockerfile` | `*` (frontend served from same origin) |
| `CAPTCHA_SECRET` | `docker-compose.yml` | Change in production (`dev-secret-change-me-in-production`) |

**Entrypoint:** `backend/entrypoint.sh` runs `prisma migrate deploy` before starting the Node.js server, so migrations are applied automatically on startup.

### Option: nginx + Node.js

```
/              → serve frontend/dist (static)
/api/*         → proxy_pass http://localhost:3000
/uploads/*     → proxy_pass http://localhost:3000
```

Example nginx `location` blocks:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /uploads/ {
    proxy_pass http://127.0.0.1:3000;
}

location / {
    root /path/to/frontend/dist;
    try_files $uri $uri/ /index.html;
}
```

Don't forget to update `CORS_ORIGIN` to the frontend domain.

## Production dependencies

Backend requires `sharp` for image resizing — ships pre-built binaries per platform; no system `libvips` needed on most platforms.
