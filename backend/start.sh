#!/bin/bash
# Tạo Prisma Client
prisma generate

# Tự động cập nhật DB schema (không mất dữ liệu nếu chỉ thêm cột)
prisma db push --accept-data-loss

# Khởi động server
if [ "$NODE_ENV" = "production" ]; then
    uvicorn app.main:app --host 0.0.0.0 --port 8000
else
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude "*.db" --reload-exclude "backups/*"
fi
