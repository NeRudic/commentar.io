# comentar.io

## Stack

- **Backend:** NestJS 11 + SQLite3 + class-validator
- **Frontend:** React 19 + Vite 8 + TypeScript 6 + CSS Modules
- **Shared types:** `shared/api/types/` (импортируются через алиас `@shared`)

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
│       └── services/     # Fetch-сервисы для бэкенда
└── shared/
    └── api/types/        # Общие контракты API
```

## Key conventions

- **Стили:** CSS Modules (`.module.css`)
- **Формы:** @tanstack/react-form + valibot
- **Алиас:** `@shared` → корневой `shared/`
- **Проверка:** ESLint (frontend), class-validator (backend)
- **Коммиты:** Conventional Commits
