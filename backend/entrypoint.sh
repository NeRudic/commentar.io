#!/bin/sh
set -e

echo "Running prisma migrations"
npx prisma migrate deploy

echo "Starting NestJS"
exec node dist/main.js