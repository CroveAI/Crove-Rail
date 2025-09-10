# Troubleshooting Guide

## Common Issues and Solutions

### 1. localhost:3015 Not Accessible But dev.crove.com Works

**Symptoms:**
- `curl http://localhost:3015` returns `Connection reset by peer`
- `https://dev.crove.com` works fine through Cloudflare tunnel
- Docker container shows as running

**Root Cause:**
MiniProfiler gem has compatibility issues with newer Rack versions, causing:
```
NameError: uninitialized constant Rack::File
```

**Solution:**
Restart the Rails container to clear the error state:
```bash
docker-compose restart rails
```

---

### 2. Cloudflare Tunnel Connection Refused

**Symptoms:**
- Cloudflare tunnel logs show: `dial tcp [::1]:3015: connect: connection refused`
- Site not accessible via Cloudflare domain

**Root Cause:**
Network configuration mismatch between Cloudflare tunnel and Rails container.

**Solution:**
Ensure Cloudflare tunnel uses `network_mode: host` in docker-compose.yaml:
```yaml
cloudflared:
  image: cloudflare/cloudflared:latest
  container_name: cloudflared
  network_mode: host
  environment:
    - TUNNEL_TOKEN=your_token_here
  command: tunnel run
```

---

### 3. Facebook Webhooks Not Processing Messages

**Symptoms:**
- Facebook webhook verification passes
- Messages sent to page not appearing in Chatwoot
- No errors in logs

**Root Cause:**
Missing initial database records (Account, Channel, Inbox).

**Solution:**
After deployment, create initial data:
```bash
# See Docs/DEPLOYMENT_AZURE_VM.md step 4 for full SQL
docker exec crove-postgres psql -U postgres -d chatwoot_production < initial_data.sql
```

---

### 4. Docker Container Fails to Start

**Symptoms:**
- Container exits immediately after starting
- Error: `exec format error` or similar

**Root Cause:**
Platform architecture mismatch (ARM vs x86_64).

**Solution:**
Rebuild images for your platform:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

### 5. Redis Connection Errors

**Symptoms:**
- Sidekiq fails to start
- Error: `Error connecting to Redis on redis:6379`

**Solution:**
Check Redis container status and restart if needed:
```bash
docker ps | grep redis
docker-compose restart redis
docker-compose restart sidekiq
```

---

### 6. Asset Compilation Errors

**Symptoms:**
- Vite/Webpack errors during startup
- Missing JavaScript/CSS files

**Solution:**
Clear cache and rebuild assets:
```bash
docker exec rails rm -rf tmp/cache/*
docker exec rails rm -rf public/packs/*
docker-compose restart vite
docker-compose restart rails
```

---

### 7. Database Migration Pending

**Symptoms:**
- Rails shows migration pending error
- ActiveRecord::PendingMigrationError

**Solution:**
Run migrations:
```bash
docker exec rails bundle exec rails db:migrate
```

---

### 8. Port Already in Use

**Symptoms:**
- Error: `bind: address already in use`
- Cannot start container

**Solution:**
Find and kill process using the port:
```bash
# Find process using port 3015
sudo lsof -i :3015
# Or
sudo ss -tulpn | grep 3015

# Kill the process
sudo kill -9 <PID>
```

---

### 9. Sidekiq Jobs Not Processing

**Symptoms:**
- Jobs queued but not executing
- Facebook messages stuck in queue

**Solution:**
Check Sidekiq logs and restart:
```bash
docker logs sidekiq --tail 50
docker-compose restart sidekiq
```

Ensure Redis is running:
```bash
docker exec redis redis-cli ping
# Should return PONG
```

---

### 10. SSL Certificate Issues with dev.crove.com

**Symptoms:**
- SSL certificate warnings in browser
- Cannot access site via HTTPS

**Solution:**
This is handled by Cloudflare automatically. If issues persist:
1. Check Cloudflare dashboard for tunnel status
2. Ensure tunnel token is valid
3. Restart Cloudflare tunnel container:
```bash
docker-compose restart cloudflared
```

---

## Debugging Commands

### View Container Logs
```bash
# Rails logs
docker logs rails --tail 100 -f

# Sidekiq logs  
docker logs sidekiq --tail 100 -f

# Cloudflare tunnel logs
docker logs cloudflared --tail 100 -f
```

### Check Container Status
```bash
# List all containers
docker ps -a

# Check specific container details
docker inspect <container_name>
```

### Access Container Shell
```bash
# Rails console
docker exec -it rails rails console

# Bash shell
docker exec -it rails bash
```

### Network Debugging
```bash
# Check port bindings
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Test internal connectivity
docker exec rails curl -I http://localhost:3000

# Check Docker networks
docker network ls
docker network inspect crove_default
```

### Database Access
```bash
# PostgreSQL shell
docker exec -it DB psql -U postgres -d chatwoot_production

# Check database tables
docker exec DB psql -U postgres -d chatwoot_production -c "\dt"
```

---

## Environment-Specific Issues

### Local Development (dev.crove.com)
- Cloudflare tunnel must be running
- Check tunnel token validity
- Ensure ports 3015, 3036, 6379, 5432 are available

### Beta Environment (beta.crove.com)
- Hosted on Azure VM (52.172.194.116)
- Facebook webhook URL: https://beta.crove.com/bot
- SSH access required for debugging
- Check Azure VM resource status

---

## Getting Help

If issues persist:
1. Check container logs for specific error messages
2. Verify all environment variables in `.env` file
3. Ensure Docker and Docker Compose are up to date
4. Review recent commits for breaking changes
5. Create issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Docker/OS versions