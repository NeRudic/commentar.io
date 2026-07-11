# Деплой

## Переменные окружения

### Бэкенд (`backend/.env`)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `PORT` | Порт сервера | `3000` |
| `CORS_ORIGIN` | Разрешённый origin | `http://localhost:5173` |
| `CAPTCHA_SECRET` | Секрет для JWT капчи | `random-256-bit-string` |

### Frontend

Переменные окружения не используются. Базовый URL бэкенда задан в `frontend/src/services/index.ts` как `http://localhost:3000`. Для продакшена изменить на продакшен-URL.

## Сборка

### Backend

```bash
cd backend
npm install
npm run build        # → dist/
npm run start:prod   # node dist/main
```

### Frontend

```bash
cd frontend
npm install
npm run build        # → dist/ (статический сайт)
```

## Продакшен

### Вариант: nginx + Node.js

```
/              → serve frontend/dist (статику)
/api/*         → proxy_pass http://localhost:3000
/uploads/*     → proxy_pass http://localhost:3000
```

Пример `location` для nginx:

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

Не забудьте обновить `CORS_ORIGIN` на домен фронтенда.

## Зависимости продакшена

Бэкенд требует `sharp` (нативный модуль) — может потребоваться `libvips` на сервере.
