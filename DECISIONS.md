# DECISIONS.md

## 2026-06-22 — Shared API types at root

**Решение:** Общие типы бэкенд-контрактов вынесены в корневой `shared/api/types/`.

**Почему:**
- Типы должны быть единым источником правды для обеих частей проекта.

**Как подключено:**
- Алиас `@shared` настроен в `vite.config.ts` (resolve.alias) и `tsconfig.app.json` (paths).
- Бэкенд использует `paths: { "@shared/*": ["../shared/*"] }` в `tsconfig.json`.
- Сервисы импортируют через `import type { ... } from '@shared/api/types'`.

## 2026-06-27 — Переход с fetch на axios на фронтенде

**Решение:** Вместо нативного `fetch` фронтенд-сервисы используют `axios` (`^1.18.1`).

**Почему:** Личное предпочтение, удобнее API.

**Как подключено:**
- `axios` добавлен в `frontend/package.json` dependencies.
- Сервисы в `frontend/src/services/` используют `axios.get<T>()` с базовым URL `http://localhost:3000/`.
