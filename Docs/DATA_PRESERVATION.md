# Data Preservation Guide

## Critical Rules to Prevent Data Loss

### ⚠️ NEVER DO THESE
1. **NEVER** run `docker-compose down` - it can remove volumes
2. **NEVER** stop or remove the `crove-postgres` container
3. **NEVER** delete or recreate the `joy_postgres_data` volume
4. **NEVER** run `dropdb` or `DROP DATABASE` commands without backup
5. **NEVER** use `docker-compose up --force-recreate` for postgres

### ✅ ALWAYS DO THESE
1. **ALWAYS** backup before any deployment or update
2. **ALWAYS** use `docker stop` + `docker rm` for app containers only
3. **ALWAYS** keep postgres container running during deployments
4. **ALWAYS** verify backup file size before proceeding
5. **ALWAYS** test restore process on staging first

## Safe Update Process

### Method 1: Using Safe Deploy Script (Recommended)
```bash
# This script handles everything safely
./scripts/safe-deploy.sh

# Or with specific image
./scripts/safe-deploy.sh joyai/crove-rails:v2.0
```

### Method 2: Manual Safe Update
```bash
# 1. Backup database first
docker exec crove-postgres pg_dump -U postgres -d chatwoot_production | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. Stop ONLY app containers (NOT database)
docker stop crove-rails crove-sidekiq
docker rm crove-rails crove-sidekiq

# 3. Pull new image
docker pull joyai/crove-rails:latest

# 4. Start new containers
docker run -d --name crove-rails --restart always \
  -p 3015:3000 \
  --network crove-network \
  -e DATABASE_URL=postgresql://postgres:postgres@crove-postgres:5432/chatwoot_production \
  [other env vars] \
  joyai/crove-rails:latest

# 5. Run migrations
docker exec crove-rails bundle exec rails db:migrate RAILS_ENV=production
```

## Docker Compose Safety

### Current Setup
```yaml
# docker-compose.production.yml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data  # This preserves data
```

### Volume Persistence

**Local Development (Current Setup):**
- Type: Bind mount (not Docker volume)
- Host path: `D:\Projects\JOY\Postgre\data` (Windows) or equivalent on Linux
- Container path: `/var/lib/postgresql/data`
- This is a direct filesystem mount, data persists on host

**Production (Azure VM):**
- Volume name: `crove_postgres_data` (Docker managed volume)
- Location: Docker manages this in `/var/lib/docker/volumes/`
- This volume contains ALL database data
- As long as this volume exists, data is safe

## GitHub Actions Deployment

The workflow is configured to:
1. Create automatic backup before deployment
2. Stop only Rails/Sidekiq containers
3. Keep postgres running
4. Use `docker run` instead of `docker-compose up` to avoid recreating database

## Emergency Recovery

### If Data is Lost
```bash
# 1. Find latest backup
ls -lht /home/joy/backups/database/*.gz

# 2. Stop Rails (not database)
docker stop crove-rails crove-sidekiq

# 3. Restore from backup
gunzip -c /home/joy/backups/database/[backup_file].sql.gz | \
  docker exec -i crove-postgres psql -U postgres -d chatwoot_production

# 4. Restart Rails
docker start crove-rails crove-sidekiq
```

### Verify Data Integrity
```bash
# Check key tables
docker exec crove-postgres psql -U postgres -d chatwoot_production -c "
  SELECT 'Accounts:' as table, COUNT(*) FROM accounts
  UNION ALL
  SELECT 'Users:', COUNT(*) FROM users  
  UNION ALL
  SELECT 'Messages:', COUNT(*) FROM messages;
"
```

## Best Practices

1. **Regular Backups**: Automated backups before each deployment
2. **Test Restores**: Periodically test backup restoration
3. **Monitor Disk Space**: Ensure enough space for backups
4. **Version Control**: Tag Docker images with versions
5. **Staging Environment**: Test updates on staging first

## Common Mistakes to Avoid

❌ **Wrong**: `docker-compose down && docker-compose up`
✅ **Right**: `docker stop crove-rails && docker rm crove-rails && docker run ...`

❌ **Wrong**: Updating docker-compose.yml postgres version without migration
✅ **Right**: Keep postgres version stable or plan careful migration

❌ **Wrong**: Using `--force-recreate` or `--remove-orphans` 
✅ **Right**: Selectively update only app containers

## Monitoring

Check data persistence:
```bash
# View volume details (Production)
docker volume inspect crove_postgres_data

# Check bind mount (Local Development)
docker inspect DB --format='{{json .Mounts}}' | python3 -m json.tool

# Check volume usage
docker system df -v | grep postgres

# Verify volume mount
docker inspect crove-postgres | grep -A5 Mounts
```

## Contact

If data loss occurs:
1. DO NOT restart or recreate postgres container
2. Check `/home/joy/backups/database/` for recent backups
3. Use restoration script: `./scripts/restore-database.sh [backup_file]`