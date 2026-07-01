# SPEC: Comment Form + CAPTCHA + Comments Display + File Upload

## Цель

1. Кнопка «комментировать» на посте → модал с формой
2. Поля формы: User Name, Email, HomePage (url), CAPTCHA, текст, файл
3. Загрузка файлов: отдельный эндпоинт с валидацией и сжатием изображений
4. Существующие комментарии отображаются под постом

---

## Порядок выполнения

### Phase 1 — CommentForm

Форма на `react-hook-form` + `valibot` (валидация).

Пропсы: `postId`, `onClose`, `onSuccess`.

При mount: запросить CAPTCHA.

Сабмит: verifyCaptcha → createUser → createComment → onSuccess.

Поля: user_name, email, home_page, text, captcha (вопрос + инпут), file.

Файлы: `CommentForm/CommentForm.tsx`, `CommentForm/CommentForm.module.css`.

**Статус:**
- [x] CAPTCHA (вопрос, инпут, верификация при сабмите, перезапрос при ошибке)
- [x] File input (accept, клиентская валидация типа и размера txt)
- [ ] Интеграция с эндпоинтом загрузки (upload, затем createComment с file_path)
- [ ] CSS-модуль
- [ ] Валидация через valibot

### Phase 1.5 — File Upload (отдельный модуль) ✅

Эндпоинт: `POST /file-upload/verify` (multipart/form-data, поле `file`).

Флоу: клиент загружает файл → сервис валидирует → сжимает изображения → сохраняет в `uploads/` → возвращает путь. Затем путь передаётся в `POST /comments`.

**Зависимость:** `sharp` (libvips, асинхронный, не блокирует main thread).

**Архитектура:**
- `file-upload.config.ts` — все константы (`ALLOWED_TYPES`, `MAX_FILE_SIZE`, `MAX_WIDTH/HEIGHT`, `TXT_MAX_SIZE`, `RANDOM_RANGE`, `MIME_TO_EXT`, `UPLOADS_DIR`)
- `file-upload.module.ts` — `OnModuleInit` создаёт `uploads/` при старте приложения (а не при первом запросе)
- `file-upload.controller.ts` — `FileInterceptor` с `memoryStorage`, грубый лимит 10 МБ
- `file-upload.service.ts` — проверка MIME-типов (с `BadRequestException`), валидация txt, ресайз через `sharp`

**Хранение:** `memoryStorage` — файл в RAM (`file.buffer`), пишется на диск только после успешной валидации. Без `diskStorage` нет нужды в `unlink`/`rename`/cleanup.

**Логика валидации:**

| Тип | Проверка |
|-----|----------|
| `text/plain` | размер ≤ 100 КБ |
| `image/jpeg`, `image/gif`, `image/png` | ресайз до ≤ 320×240 с сохранением пропорций |

**Стратегия сжатия:**
```js
sharp(buffer).resize(320, 240, { fit: 'inside', withoutEnlargement: true }).toFile(output)
```
- `fit: 'inside'` — вписывает в bounding box, сохраняя пропорции
- `withoutEnlargement: true` — не увеличивает изображения меньше лимита

**Именование:** `{timestamp}-{random}.{ext}`, random из диапазона `1_000_000`.

**Ответ:**
```json
{ "path": "/uploads/1735708800-482739123.png" }
```

**Раздача статики:** в `main.ts` через `app.useStaticAssets(join(cwd, UPLOADS_DIR), { prefix: '/uploads' })`, где `UPLOADS_DIR` импортирован из конфига.

**Файлы:**
```
backend/src/file-upload/
├── file-upload.config.ts
├── file-upload.module.ts
├── file-upload.controller.ts
└── file-upload.service.ts
```

**Статус:**
- [x] Модуль, контроллер, сервис, конфиг
- [x] memoryStorage + валидация в сервисе
- [x] OnModuleInit для создания uploads/
- [x] main.ts — useStaticAssets с константой из конфига
- [x] create-comment.dto.ts — @IsUrl → @IsString для file_path

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
frontend/src/components/CommentForm/CommentForm.module.css
frontend/src/components/Comment/Comment.tsx
frontend/src/components/Comment/Comment.module.css
frontend/src/components/CommentList/CommentList.tsx
frontend/src/components/CommentList/CommentList.module.css
```

### Изменить

```
backend/src/comment/comment.service.ts        # createComment → возвращать CommentRowDTO (SELECT + JOIN)
backend/src/comment/comment.controller.ts     # тип возврата createComment → CommentRowDTO
frontend/src/components/CommentForm/CommentForm.tsx # интеграция upload-эндпоинта
frontend/src/components/Post/Post.tsx         # модал + CommentList
```

### Сделано ✅

```
backend/src/file-upload/file-upload.config.ts
backend/src/file-upload/file-upload.module.ts
backend/src/file-upload/file-upload.controller.ts
backend/src/file-upload/file-upload.service.ts
backend/src/main.ts                           # useStaticAssets + UPLOADS_DIR из конфига
backend/src/app.module.ts                     # импорт FileUploadModule
backend/src/comment/dto/create-comment.dto.ts # @IsUrl → @IsString для file_path
```

---

## Примечания

- `PostProps.postId` — `string`, API ждёт `number` → `Number(postId)`
- Загрузка файлов: `memoryStorage` → валидация (`BadRequestException`) → запись на диск → `{ path }` → путь в `createComment`
- `file_path` в DTO больше не валидируется как URL — это относительный путь `/uploads/...`, проверяется через `@IsString()`
- MIME-типы проверяются в сервисе (а не в `fileFilter` контроллера), чтобы отдавать `400 Bad Request` вместо `500`
- Изображения сжимаются через `sharp` (libvips — нативные потоки, не блокирует event loop)
- Константы (`MAX_WIDTH`, `MAX_FILE_SIZE`, и т.д.) вынесены в `file-upload.config.ts`, импортируются в `main.ts` и сервис
- Директория `uploads/` создаётся в `FileUploadModule.onModuleInit()`, а не в сервисе при обработке запроса
- CAPTCHA stateless через JWT с `expiresIn: 5m`, секрет из `.env`
- Формы на `react-hook-form` + `valibot` (уже в проекте)
- Для оптимистичного UI: `POST /comments` должен возвращать полный `CommentRowDTO` (с `user_name`, `home_page` через JOIN), а не `{ lastID, changes }`
- Shared-типы (`shared/api/types/`) — не актуальны, типы определяются локально
