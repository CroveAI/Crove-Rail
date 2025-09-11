# Docker Compose Watch Setup

## Overview
Auto-rebuild và sync code khi có thay đổi, không cần rebuild thủ công.

## Cách sử dụng

### Bắt đầu watch mode:
```bash
docker compose watch
```

### Hoặc chạy cùng với up:
```bash
docker compose up --watch
```

## Cấu hình hiện tại

### Rails Service
- **Rebuild khi thay đổi**: Gemfile (cài gem mới)
- **Sync tự động**: app/, config/, db/, lib/
- **Sync + Restart**: config/initializers/

### Sidekiq Service  
- **Sync + Restart**: app/jobs/, app/workers/
- **Sync tự động**: config/

### Vite Service
- **Sync tự động**: app/javascript/, app/frontend/
- **Sync + Restart**: vite.config.ts, package.json

## Actions giải thích

- `rebuild`: Build lại image (cho dependencies)
- `sync`: Copy files vào container (code thay đổi)
- `sync+restart`: Copy files và restart service

## Lưu ý

1. Watch chạy foreground, cần terminal riêng
2. Ctrl+C để dừng watch
3. Chỉ watch các path đã config
4. Gemfile/package.json thay đổi sẽ rebuild (mất thời gian)

## Troubleshooting

Nếu watch không hoạt động:
```bash
# Check version (cần >= 2.22)
docker compose version

# Xem config đầy đủ
docker compose config | grep -A 10 develop

# Restart với watch
docker compose down
docker compose up --watch
```