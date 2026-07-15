# comentar.io

## Stack

- **Backend:** NestJS 11 + Prisma (SQLite) + class-validator
- **Frontend:** React 19 + Vite 8 + TypeScript 6 + CSS Modules
- **Frontend types:** local in `frontend/src/types/`

## Project structure

```
comentar.io/
├── backend/              # NestJS API (port 3000)
│   └── src/
│       ├── prisma/       # Prisma service, module, types
│       ├── user/         # POST /users
│       ├── comment/      # Comment CRUD
│       ├── captcha/      # Math captcha (JWT)
│       ├── file-manager/ # File upload, staging, publish, cleanup
│       └── orchestrator/ # User+comment transaction
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # React components (CSS Modules)
│       ├── data/         # Mock data (placeholder)
│       ├── services/     # Axios services
│       └── types/        # Local types (comment, user, captcha)
└── docs/                 # Documentation
```

## Key conventions

- **Styles:** CSS Modules (`.module.css`)
- **Forms:** react-hook-form + valibot
- **Validation:** ESLint (frontend), class-validator (backend)
- **Commits:** Conventional Commits
