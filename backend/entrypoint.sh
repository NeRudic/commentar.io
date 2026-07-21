#!/bin/sh
set -e

echo "Running prisma migrations"
export DATABASE_URL="file:./prisma/db.sqlite"
npx prisma migrate deploy

echo "Starting NestJS"
exec node dist/backend/src/main.js
