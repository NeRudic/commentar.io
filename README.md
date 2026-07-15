# comentar.io — blog comment system

NestJS API + React SPA with nested comments, file attachments, and math captcha.

## Quick start

```bash
git clone <repo>
cd backend && npm install && npm run start:dev
# in a new terminal:
cd frontend && npm install && npm run dev
```

Backend: http://localhost:3000, Frontend: http://localhost:5173.

## Documentation

| Section | Description |
|---------|-------------|
| [Architecture](docs/architecture.md) | Modules, components, data flow |
| [API](docs/api.md) | Endpoints, DTOs, request examples |
| [Database](docs/database.md) | SQLite schema, tables, indexes |
| [Deployment](docs/deployment.md) | Env, build, production |
| [Development](docs/development.md) | Commands, conventions, lint, tests |
| [Decisions](docs/DECISIONS.md) | Architectural decisions log |
| [OpenCode](docs/OPENCODE.md) | Tool reference |
| [Spec](docs/SPEC_COMMENTS.md) | Feature requirements |

## Repository structure

```
├── backend/     # NestJS 11 + Prisma (SQLite)
├── frontend/    # React 19 + Vite 8
├── docs/        # Documentation
├── AGENTS.md    # AI agent instructions
└── CLAUDE.md    # Project rules and conventions
```
