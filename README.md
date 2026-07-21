# comentar.io — blog comment system

NestJS API + React SPA with nested comments, file attachments, and SVG captcha.

## Quick start (Docker)

```bash
git clone <repo>
docker compose up --build
```

Open http://localhost:3000. The frontend is served by NestJS from the same origin.

## Development (without Docker)

```bash
# terminal 1:
cd backend && npm install && npm run start:dev
# terminal 2:
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
| [Decisions](docs/DECISIONS.md) | Architectural decisions log |
| [OpenCode](docs/OPENCODE.md) | Tool reference |
| [Spec](docs/SPEC_COMMENTS.md) | Feature requirements |

## Repository structure

```
├── backend/     # NestJS 11 + Prisma (SQLite)
├── frontend/    # React 19 + Vite 8
├── shared/      # canonical tag/attribute config
├── docs/        # Documentation
├── AGENTS.md    # AI agent instructions
└── CLAUDE.md    # Project rules and conventions
```
