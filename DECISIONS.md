# DECISIONS.md

## 2026-06-22 — Shared API types at root, fetch-based services (ПЕРЕСМОТРЕНО)

**Решение:** Общие типы бэкенд-контрактов вынесены в корневой `shared/api/types/`.
Фронтенд-сервисы созданы на нативном `fetch` (без axios или другой HTTP-библиотеки).

**Почему:**
- Типы должны быть единым источником правды для обеих частей проекта.
- Нативный `fetch` — нулевая зависимость, встроен во все современные браузеры.
- Небольшое приложение не требует прослойки в виде axios.

**Как подключено:**
- Алиас `@shared` настроен в `vite.config.ts` (resolve.alias) и `tsconfig.app.json` (paths).
- Сервисы импортируют через `import type { ... } from '@shared/api/types'`.

## 2026-06-30 — Отказ от shared-типов, переход на axios

**Решение:** Типы перенесены локально в `frontend/src/types/` (разделены на `comment.ts`, `user.ts`, `captcha.ts` с barrel-реэкспортом через `index.ts`).
Сервисы переписаны с `fetch` на `axios` (`^1.18.1`).

**Почему:**
- Shared-типы оказались неудобны при расхождении бэкенд/фронтенд-представлений (JOIN-поля).
- `axios` — удобнее API, автоматический JSON-парсинг, перехватчики.
- Локальные типы проще поддерживать итеративно, без синхронизации между пакетами.

## 2026-06-30 — Отказ от @tanstack/react-form, переход на react-hook-form

**Решение:** Замена `@tanstack/react-form` (^1.33.0) на `react-hook-form` для CommentForm.

**Почему:**
- `@tanstack/react-form` v1.33 имеет 22 generic-параметра, что делает невозможным написание переиспользуемых обёрток без `any`.
- Бойлерплейт: `form.Field` + `form.Subscribe` создают ~15 строк на каждое поле против 1 строки `register()` в RHF.
- RHF — зрелая библиотека, 1 дженерик (`useForm<T>()`), встроенные `isSubmitting`, `errors`, `register`.

**Что изменилось:**
- `@tanstack/react-form` и `@tanstack/valibot-form-adapter` удалены.
- `FormField` компонент-обёртка удалён — `register()` самодостаточен.
- Валидация (valibot) будет подключаться через `@hookform/resolvers/valibot` или вручную в `register` options.

## 2026-07-08 — Полное удаление shared/api/types

**Решение:** Удалена директория `shared/` и все алиасы `@shared` из tsconfig/vite.
`svelte/UserRow` перенесён в `backend/src/user/user.types.ts`.

**Почему:**
- Frontend давно использует локальные типы (`frontend/src/types/`).
- Backend использует DTO с `class-validator`, единственный потребитель shared — `UserRow` в `UserService`.
- Алиасы `@shared` в tsconfig/vite были мёртвым конфигом.

**Что изменилось:**
- Создан `backend/src/user/user.types.ts` с `UserRow`.
- `user.service.ts` импортирует `UserRow` локально.
- Удалены алиасы `@shared` из `backend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/vite.config.ts`.
- Директория `shared/` удалена.
