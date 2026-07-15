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

No env vars used. Backend URL is hardcoded in `frontend/src/services/index.ts` as `http://localhost:3000`. Change to production URL for deployment.

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

Backend requires `sharp` (native module) — may need `libvips` on the server.
