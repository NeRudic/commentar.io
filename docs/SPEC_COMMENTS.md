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
- [ ] **15. File preview (lightbox)** — visual effects for file viewing
- [ ] **16. Orphaned file cleanup** — periodic cleanup of `.tmp/` and `uploads/` files with `pending` status; uses file mtime for `.tmp/` and `created_at` for `file` table rows

### HTML tags

- [x] **16. Allowed tags** — `<a href="" title="">`, `<code>`, `<i>`, `<strong>`
- [ ] **17. XHTML validation** — closing tag check, must be valid XHTML
- [x] **18. Client and server validation** — `valibot` (client), `class-validator` + `SanitizePipe` (server)

### UX

- [x] **19. Message preview** — without page reload (Preview mode in `TextEditor`)
- [x] **20. Toolbar buttons** — `[i]`, `[strong]`, `[code]`, `[a]` in `TextEditor` toolbar
- [ ] **21. Visual effects** — animations, transitions (partially done: CSS transitions)

---

## Status

| Status   | Count |
| -------- | ----- |
| Done     | 18    |
| Not done | 4     |

---

## Notes

- Types are local in `frontend/src/types/`, `shared/` removed
- Backend: `sqlite3`, no ORM, raw queries via `DB` service
- File uploads: `memoryStorage` → validation → write to `.tmp/`. On comment creation: COPY to `uploads/` inside transaction, then delete `.tmp/` copy. `sharp` for resize
- Orphaned file cleanup: `FileCleanupService` runs periodically, removes `.tmp/` files by mtime threshold, cleans orphaned `uploads/` files matching `pending` status
- CAPTCHA: stateless via JWT (`expiresIn: 5m`), captcha integrated directly in `CommentForm`
- `TextEditor`: communicates with form via `onValueChange` callback, without `register()` on the DOM element. Storage format — XHTML
- `Button`: reusable wrapper `<button type="button">`, styled in parent CSS modules
- `<a>` tags with `href`/`title` attributes allowed on backend (`sanitize.pipe.ts`) and frontend (`utils/sanitize.ts`)
