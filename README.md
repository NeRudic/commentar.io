# comentar.io — система комментариев к блогу

NestJS API + React SPA с вложенными комментариями, файловыми вложениями и математической капчей.

## Быстрый старт

```bash
git clone <repo>
cd backend && npm install && npm run start:dev
# в новом окне:
cd frontend && npm install && npm run dev
```

Бэкенд: http://localhost:3000, фронтенд: http://localhost:5173.

## Документация

| Раздел | Описание |
|--------|----------|
| [Архитектура](docs/architecture.md) | Модули, компоненты, поток данных |
| [API](docs/api.md) | Эндпоинты, DTO, примеры запросов |
| [БД](docs/database.md) | Схема SQLite, таблицы, индексы |
| [Деплой](docs/deployment.md) | Окружение, сборка, продакшен |
| [Разработка](docs/development.md) | Команды, соглашения, lint, тесты |

## Структура репозитория

```
├── backend/     # NestJS 11 + SQLite3
├── frontend/    # React 19 + Vite 8
├── docs/        # Документация
├── AGENTS.md    # Инструкция для ИИ-агента
├── CLAUDE.md    # Правила и конвенции
├── DECISIONS.md # Архитектурные решения
└── OPENCODE.md  # Шпаргалка по инструментам
```
