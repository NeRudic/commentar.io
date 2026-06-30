# DECISIONS.md

## 2026-06-22 — Shared API types at root, fetch-based services

**Решение:** Общие типы бэкенд-контрактов вынесены в корневой `shared/api/types/`.
Фронтенд-сервисы созданы на нативном `fetch` (без axios или другой HTTP-библиотеки).

**Почему:**
- Типы должны быть единым источником правды для обеих частей проекта.
- Нативный `fetch` — нулевая зависимость, встроен во все современные браузеры.
- Небольшое приложение не требует прослойки в виде axios.

**Как подключено:**
- Алиас `@shared` настроен в `vite.config.ts` (resolve.alias) и `tsconfig.app.json` (paths).
- Сервисы расположены в `frontend/src/services/`, импортируют через `import type { ... } from '@shared/api/types'`.
