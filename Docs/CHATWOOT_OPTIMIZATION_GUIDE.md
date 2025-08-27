# 🚀 Hướng dẫn tối ưu Chatwoot Development

## 🔍 Vấn đề thường gặp

Chatwoot trong môi trường development thường:
- **Khởi động chậm**: 30-45 giây mỗi request
- **Bị treo**: Rails process không phản hồi
- **Tốn RAM**: >2GB chỉ cho Rails

## ✅ Giải pháp đã chuẩn bị

### 1. **Scripts PowerShell**

```powershell
# Kiểm tra trạng thái
.\check-chatwoot.ps1

# Khởi động tối ưu
.\start-chatwoot-optimized.ps1

# Monitor real-time (tự restart khi treo)
.\monitor-chatwoot.ps1
```

### 2. **Docker Compose Override**
File `docker-compose.override.yml` đã được tạo với:
- Giới hạn CPU/RAM cho mỗi service
- Tối ưu PostgreSQL performance
- Cache volumes riêng
- Environment variables tối ưu

## 🛠️ Cách sử dụng

### Khởi động nhanh:
```powershell
# Dừng toàn bộ và khởi động lại với cấu hình tối ưu
docker-compose down
docker-compose up -d
```

### Monitor và auto-restart:
```powershell
# Chạy trong terminal riêng
.\monitor-chatwoot.ps1 -CheckInterval 20 -Timeout 10
```

## 💡 Tips thêm

### 1. **Tăng RAM cho Docker Desktop**
- Settings → Resources → Memory: **8GB** recommended
- CPUs: **4 cores** minimum

### 2. **Disable không cần thiết**
Trong `config/environments/development.rb`:
```ruby
config.assets.debug = false
config.assets.compress = true
```

### 3. **Sử dụng Production-like mode**
```powershell
# Chạy với RAILS_ENV=production nhưng với debug
docker-compose run -e RAILS_ENV=production -e RAILS_SERVE_STATIC_FILES=true rails
```

## 🎯 Kết quả mong đợi

Sau khi tối ưu:
- First load: 15-20 giây (từ 45 giây)
- Subsequent loads: 3-5 giây
- RAM usage: <1.5GB
- Auto-restart khi treo

## ⚡ Quick Commands

```powershell
# Restart nhanh khi treo
docker restart rails

# Clear cache khi quá chậm
docker exec rails bundle exec rails tmp:clear

# Xem logs real-time
docker-compose logs -f rails --tail 100

# Check memory usage
docker stats rails --no-stream
```

## 🔄 Nếu vẫn chậm

1. **Xóa volumes và build lại**:
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

2. **Chuyển sang Linux/WSL2**:
- Performance tốt hơn đáng kể
- File system nhanh hơn

3. **Cân nhắc dùng Gitpod/GitHub Codespaces**:
- Cloud development environment
- Không phụ thuộc local machine

---

**Lưu ý**: Những tối ưu này chỉ cho development. Production deployment cần cấu hình khác! 