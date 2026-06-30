# SPEC: Comment Form + CAPTCHA + Comments Display

## Цель

1. Кнопка «комментировать» на посте → модал с формой
2. Поля формы: User Name, Email, HomePage (url), CAPTCHA, текст, файл (заглушка)
3. Существующие комментарии отображаются под постом

---

## Порядок выполнения

### Phase 1 — CommentForm

Форма на `@tanstack/react-form` + `valibot`.

Пропсы: `postId`, `onClose`, `onSuccess`.

При mount: запросить CAPTCHA.

Сабмит: verifyCaptcha → createUser → createComment → onSuccess.

Поля: user_name, email, home_page, text, captcha (вопрос + инпут), file (disabled).

Файлы: `CommentForm/CommentForm.tsx`, `CommentForm/CommentForm.module.css`.

---

### Phase 2 — Компоненты отображения

**CommentList:** контейнер для поста. Фетчит корневые комментарии (`GET /comments/:post_id`). Рендерит массив `<Comment>` с `depth=0`.

**Comment (React.memo):** рекурсивный, принимает `comment: CommentRow` и `depth: number`.

- Рендерит: аватар, имя (ссылка если home_page), текст, дата, файл
- Отступ через `marginLeft: depth * 24px`
- При `depth < 4`: кнопка «Показать ответы» → фетчит `GET /comments/:id/replies` → сохраняет в локальный стейт → рекурсивно рендерит `<Comment depth+1>`
- При `depth >= 4`: вместо рекурсии — ссылка на родительский комментарий
- Кнопка «Ответить» → показывает CommentForm внутри себя
- Оптимистичный UI при создании реплая: новый комментарий добавляется в локальный стейт сразу, затем заменяется ответом сервера. При ошибке сервера — удаляется с показом ошибки. Дочерние `<Comment>` не перерендериваются (`React.memo` + стабильные `key`).

Файлы: `Comment/Comment.tsx`, `Comment/Comment.module.css`, `CommentList/CommentList.tsx`, `CommentList/CommentList.module.css`.

---

### Phase 3 — Интеграция в Post

- Добавить `useState` для `isModalOpen` в `Post.tsx`
- `onClick` на кнопку комментария → открыть модал
- Условный рендер `<Modal>` с `<CommentForm>`
- Отрендерить `<CommentList postId={postId} />` под постом

Файлы: `Post/Post.tsx` (изменить).

---

## Сводка файлов

### Создать (оставшиеся)

```
frontend/src/components/CommentForm/CommentForm.tsx
frontend/src/components/CommentForm/CommentForm.module.css
frontend/src/components/Comment/Comment.tsx
frontend/src/components/Comment/Comment.module.css
frontend/src/components/CommentList/CommentList.tsx
frontend/src/components/CommentList/CommentList.module.css
```

### Изменить

```
backend/src/comment/comment.service.ts   # createComment → возвращать CommentRowDTO (SELECT + JOIN)
backend/src/comment/comment.controller.ts # тип возврата createComment → CommentRowDTO
frontend/src/components/Post/Post.tsx    # модал + CommentList
```

---

## Примечания

- `PostProps.postId` — `string`, API ждёт `number` → `Number(postId)`
- Файл — `<input type="file" disabled>`, бэкенд-загрузки пока нет
- CAPTCHA stateless через JWT с `expiresIn: 5m`, секрет из `.env`
- Формы на `@tanstack/react-form` + `valibot` (уже в проекте)
- Для оптимистичного UI: `POST /comments` должен возвращать полный `CommentRowDTO` (с `user_name`, `home_page` через JOIN), а не `{ lastID, changes }`
- Shared-типы (`shared/api/types/`) — не актуальны, типы определяются локально
