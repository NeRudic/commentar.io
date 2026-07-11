# Разработка

## Команды

Все команды запускаются из директории пакета (`cd backend` или `cd frontend`).

### Backend

| Команда | Описание |
|---------|----------|
| `npm run start:dev` | Watch mode (порт 3000) |
| `npm run build` | Компиляция в dist/ |
| `npm run lint` | ESLint —fix |
| `npm run format` | Prettier |
| `npm run test` | Jest |

### Frontend

| Команда | Описание |
|---------|----------|
| `npm run dev` | Vite dev server (порт 5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |

## Соглашения

- **Коммиты:** Conventional Commits (`feat:`, `fix:`, `refactor:`)
- **Без Co-Authored-By / Signed-off-by**
- **CSS:** CSS Modules (`*.module.css`)
- **Формы:** react-hook-form + valibot
- **Prettier:** single quotes, trailing commas, 80 width, 2-space tabs
- **ESLint:** `endOfLine: "auto"` (Windows-safe)
- **Без комментариев в коде** (если не запрошено явно)
- После изменений структуры обновлять .md файлы и DECISIONS.md

## База данных

SQLite файл — `backend/src/db/db.sqlite`. Всегда запускать команды бэкенда из `backend/`, иначе путь будет неверным. Таблицы создаются автоматически при старте.

## Сборка и линтинг

Перед коммитом:
1. `npm run lint` в обоих пакетах
2. `npm run build` в frontend (проверяет tsc + vite)
3. `npm run format` в backend

## OpenCode / ИИ-агенты

- `AGENTS.md` — основная инструкция для агента
- `CLAUDE.md` — правила и конвенции проекта
- `DECISIONS.md` — лог архитектурных решений
- `OPENCODE.md` — шпаргалка по инструментам OpenCode
