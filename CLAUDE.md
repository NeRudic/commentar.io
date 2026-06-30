# comentar.io

## Stack

- **Backend:** NestJS 11 + SQLite3 + class-validator
- **Frontend:** React 19 + Vite 8 + TypeScript 6 + CSS Modules
- **Frontend types:** локально в `frontend/src/types/`

## Project structure

```
comentar.io/
├── backend/              # NestJS API (порт 3000)
│   └── src/
│       ├── db/           # SQLite, типы строк, конфиг таблиц
│       ├── user/         # POST /users
│       └── comment/      # CRUD комментариев
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # React-компоненты (CSS Modules)
│       ├── data/         # Мок-данные (заглушка)
│       ├── services/     # Axios-сервисы для бэкенда
│       └── types/        # Локальные типы (comment, user, captcha)
└── shared/
    └── api/types/        # Устарели, не используются
```

## Key conventions

- **Стили:** CSS Modules (`.module.css`)
- **Формы:** react-hook-form + valibot
- **Проверка:** ESLint (frontend), class-validator (backend)
- **Коммиты:** Conventional Commits
