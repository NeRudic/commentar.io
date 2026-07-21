FROM node:22-alpine AS backend-build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY backend/package*.json backend/
COPY shared/ shared/
RUN cd backend && npm install --ignore-scripts
COPY backend/ backend/
ENV DATABASE_URL=file:./prisma/db.sqlite
RUN cd backend && npx prisma generate && npm run build && npm rebuild better-sqlite3

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json frontend/
COPY shared/ shared/
RUN cd frontend && npm install --ignore-scripts
COPY frontend/ frontend/
RUN cd frontend && VITE_API_URL= npx vite build

FROM node:22-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package*.json ./backend/
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/prisma.config.ts ./backend/
COPY --from=backend-build /app/backend/entrypoint.sh ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY shared/ ./shared/
RUN chmod +x ./backend/entrypoint.sh
RUN mkdir -p backend/uploads backend/.tmp

ENV DATABASE_URL=file:./prisma/db.sqlite
ENV PORT=3000
ENV CORS_ORIGIN=*

EXPOSE 3000
WORKDIR /app/backend
ENTRYPOINT ["./entrypoint.sh"]