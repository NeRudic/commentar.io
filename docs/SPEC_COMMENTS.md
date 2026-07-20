# SPEC: SPA «Comments»

## Requirements

### Form fields

- [x] **1. User Name** — latin letters and digits, required
- [x] **2. E-mail** — email format, required
- [x] **3. Home page** — URL format, optional
- [x] **4. CAPTCHA** — math problem, required
- [x] **5. Text** — message text, all HTML tags forbidden except allowed ones, required

### Comments and display

- [x] **6. Nested replies** — max depth 4 levels
- [x] **7. Root comment sorting** — sortable table by User Name, E-mail, date (ascending/descending)
- [x] **8. Pagination** — 25 messages per page
- [x] **9. XSS and SQL injection protection** — `sanitize.pipe.ts` on backend, `DOMPurify` on frontend, parameterized SQL queries
- [x] **10. Default sort** — LIFO (latest first)
- [x] **11. CSS design** — CSS Modules in every component

### Files

- [x] **12. File upload** — image or text file attached to a message
- [x] **13. Images** — resized to 320×240 maintaining aspect ratio, JPG/GIF/PNG
- [x] **14. Text files** — max 100 KB, TXT format
- [x] **15. File preview (lightbox)** — visual effects for file viewing
- [x] **16. Orphaned file cleanup** — periodic cleanup of `.tmp/` and `uploads/` files with `pending` status; uses file mtime for `.tmp/` and `created_at` for `file` table rows

### HTML tags

- [x] **17. Allowed tags** — `<a href="" title="">`, `<code>`, `<i>`, `<strong>`
- [x] **18. XHTML validation** — closing tag check, must be valid XHTML
- [x] **19. Client and server validation** — `valibot` (client), `class-validator` + `SanitizePipe` (server)

### UX

- [x] **20. Message preview** — without page reload (Preview mode in `TextEditor`)
- [x] **21. Toolbar buttons** — `[i]`, `[strong]`, `[code]`, `[a]` in `TextEditor` toolbar
- [x] **22. Visual effects** — animations, transitions (CSS transitions + `@keyframes` in Toast, Lightbox, Modal)

### Update / Delete

- [x] **23. Edit comment** — Edit button opens CommentForm pre-filled with existing text and files; email + captcha required; files can be added/removed
- [x] **24. Delete comment** — Delete button opens confirmation modal with email input; backend cascades to child comments
- [x] **25. Ownership verification** — `user_email` must match comment owner for both update and delete

### Real-time

- [x] **26. Online counter** — live user count via WebSocket (`OnlineFooter`, `useOnlineCount`)

---

## Status

| Status   | Count |
| -------- | ----- |
| Done     | 26    |
| Not done | 0     |

---

## Notes

- Types are local in `frontend/src/types/`, `shared/` removed
- Backend: Prisma ORM (SQLite)
- File uploads: `memoryStorage` → validation → write to `.tmp/`. On comment creation: COPY to `uploads/` inside transaction, then delete `.tmp/` copy. `sharp` for resize
- Orphaned file cleanup: `FileCleanupService` runs periodically, removes `.tmp/` files by mtime threshold, cleans orphaned `uploads/` files matching `pending` status
- CAPTCHA: stateless via JWT (`expiresIn: 5m`), captcha integrated directly in `CommentForm` (both create and edit modes)
- Edit mode: `CommentForm` receives `initialData` prop (`{ comment_id, text, file_paths }`); user_name/email/home_page fields hidden, email field shown for ownership verification
- Delete: modal with email input + confirmation button; backend returns 403 if email doesn't match
- `TextEditor`: communicates with form via `onValueChange` callback, without `register()` on the DOM element. Storage format — XHTML
- `Button`: reusable wrapper `<button type="button">`, styled in parent CSS modules
- `<a>` tags with `href`/`title` attributes allowed on backend (`sanitize.pipe.ts`) and frontend (`utils/sanitize.ts`)
