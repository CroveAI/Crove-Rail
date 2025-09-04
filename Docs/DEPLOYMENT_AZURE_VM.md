# Azure VM Deployment Guide for Crove

## Overview
This guide documents the deployment process for Crove application on Azure VM using Docker Compose.

## Current Deployments

| Environment | URL | Type | Status |
|------------|-----|------|--------|
| Local Development | https://dev.crove.com | Docker Compose | ✅ Active |
| Beta/Staging | https://beta.crove.com | Azure VM + Docker | ✅ Active |

## Prerequisites

- Azure CLI installed and configured
- Docker and Docker Compose on Azure VM
- Domain configured with Cloudflare
- Nginx installed on VM for reverse proxy

## Architecture

```
Internet → Cloudflare → Azure VM (Nginx:80) → Docker Container (Rails:3010)
                                            → Docker Container (PostgreSQL:5432)
                                            → Docker Container (Redis:6379)
                                            → Docker Container (Sidekiq)
```

## Docker Compose Configuration

### 1. Create `docker-compose.production.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg17  # PostgreSQL with pgvector extension
    container_name: crove-postgres
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chatwoot_production
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    networks:
      - crove-network

  redis:
    image: redis:7-alpine
    container_name: crove-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - crove-network

  rails:
    image: joyai/crove-rails:latest
    container_name: crove-rails
    restart: always
    ports:
      - "3010:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=<your-secret-key>
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chatwoot_production
      - REDIS_URL=redis://redis:6379
      - RAILS_LOG_TO_STDOUT=true
      - RAILS_SERVE_STATIC_FILES=true
      - INSTALLATION_NAME=Crove
      - FRONTEND_URL=https://beta.crove.com
    # Remove PID file on start to prevent restart issues
    command: sh -c 'rm -f tmp/pids/server.pid && bundle exec rails server -b 0.0.0.0 -p 3000'
    networks:
      - crove-network

  sidekiq:
    image: joyai/crove-rails:latest
    container_name: crove-sidekiq
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=<your-secret-key>
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chatwoot_production
      - REDIS_URL=redis://redis:6379
    command: bundle exec sidekiq -C config/sidekiq.yml
    networks:
      - crove-network

volumes:
  postgres_data:
  redis_data:

networks:
  crove-network:
    driver: bridge
```

## Deployment Steps

### 1. Build and Push Docker Image

```bash
# Build production image locally
docker build -t joyai/crove-rails:latest \
  --build-arg RAILS_ENV=production \
  -f docker/Dockerfile .

# Push to Docker Hub
docker login -u joyai
docker push joyai/crove-rails:latest
```

### 2. Deploy to Azure VM

```bash
# Copy docker-compose file to VM
scp docker-compose.production.yml joy@<vm-ip>:/home/joy/

# Or use Azure CLI
az vm run-command invoke \
  --resource-group Crove \
  --name Crove-Dev \
  --command-id RunShellScript \
  --scripts "cat > /home/joy/docker-compose.production.yml << 'EOF'
$(cat docker-compose.production.yml)
EOF"
```

### 3. Start Services on VM

```bash
# SSH to VM or use Azure CLI
az vm run-command invoke \
  --resource-group Crove \
  --name Crove-Dev \
  --command-id RunShellScript \
  --scripts "cd /home/joy && docker-compose -f docker-compose.production.yml up -d"
```

### 4. Run Database Migrations

```bash
# First time setup - create and migrate database
docker run --rm \
  --network joy_crove-network \
  -e RAILS_ENV=production \
  -e DATABASE_URL=postgresql://postgres:postgres@crove-postgres:5432/chatwoot_production \
  -e REDIS_URL=redis://crove-redis:6379 \
  -e SECRET_KEY_BASE=<your-secret-key> \
  joyai/crove-rails:latest \
  bundle exec rails db:create db:migrate db:seed
```

### 5. Configure Nginx Reverse Proxy

On Azure VM, configure Nginx to proxy requests to Docker container:

```nginx
server {
    listen 80;
    server_name beta.crove.com;
    
    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Common Operations

### View Logs
```bash
# Rails logs
docker logs crove-rails -f

# All container status
docker ps

# Using Azure CLI
az vm run-command invoke \
  --resource-group Crove \
  --name Crove-Dev \
  --command-id RunShellScript \
  --scripts "docker ps"
```

### Restart Services
```bash
docker-compose -f docker-compose.production.yml restart

# Or specific service
docker restart crove-rails
```

### Update Application
```bash
# Pull new image
docker pull joyai/crove-rails:latest

# Restart containers
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Run migrations if needed
docker exec crove-rails bundle exec rails db:migrate RAILS_ENV=production
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it crove-postgres psql -U postgres -d chatwoot_production

# Backup database
docker exec crove-postgres pg_dump -U postgres chatwoot_production > backup.sql

# Restore database
docker exec -i crove-postgres psql -U postgres chatwoot_production < backup.sql
```

## Troubleshooting

### Issue: Rails container keeps restarting
**Cause**: PID file exists from previous run
**Solution**: 
```bash
docker exec crove-rails rm -f /app/tmp/pids/server.pid
docker restart crove-rails
```

### Issue: Database connection error
**Cause**: PostgreSQL version mismatch or missing pgvector extension
**Solution**: Use `pgvector/pgvector:pg17` image which includes the vector extension

### Issue: 502 Bad Gateway
**Check**:
1. Container status: `docker ps`
2. Rails logs: `docker logs crove-rails`
3. Port accessibility: `curl http://localhost:3010`
4. Nginx config: `nginx -T`

### Issue: Migration fails with vector extension error
**Solution**: Ensure using pgvector PostgreSQL image:
```yaml
postgres:
  image: pgvector/pgvector:pg17
```

## Security Considerations

1. **Environment Variables**: Store sensitive data in `.env` file, not in docker-compose
2. **Database**: Use strong passwords in production
3. **Firewall**: Only expose necessary ports (80, 443)
4. **SSL/TLS**: Use Cloudflare for SSL termination
5. **Secrets**: Generate secure `SECRET_KEY_BASE`:
   ```bash
   rails secret
   ```

## Monitoring

### Check Service Health
```bash
# All services status
docker-compose -f docker-compose.production.yml ps

# Check specific service
docker inspect crove-rails --format='{{.State.Health.Status}}'

# Memory and CPU usage
docker stats
```

### Setup Health Checks
Add to docker-compose.yml:
```yaml
rails:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## CI/CD Pipeline (Active)

### GitHub Actions Setup

The repository is configured with automated CI/CD pipeline using GitHub Actions.

#### Workflow File
Located at `.github/workflows/deploy-azure-vm.yml`

#### Features
- **Automatic deployment** on push to `main` or `develop` branches
- **Manual deployment** via GitHub Actions UI
- **Docker layer caching** for faster builds
- **Health checks** and automatic rollback on failure
- **Tagged images** with commit SHA for easy tracking

### Setup Instructions

#### 1. Install GitHub CLI
```bash
# Ubuntu/Debian (official method)
(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
    && sudo mkdir -p -m 755 /etc/apt/keyrings \
    && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && sudo apt update \
    && sudo apt install gh -y
```

#### 2. Authenticate GitHub CLI
```bash
gh auth login
# Choose: GitHub.com → HTTPS → Login with web browser
```

#### 3. Configure GitHub Secrets

**Docker Hub Credentials:**
```bash
# Set Docker Hub username
gh secret set DOCKER_USERNAME --body "joyai" --repo CroveAI/Crove

# Create Docker Hub Personal Access Token at https://hub.docker.com/settings/security
# Then set the token:
gh secret set DOCKER_PASSWORD --body "YOUR_DOCKER_TOKEN" --repo CroveAI/Crove
```

**Azure Credentials:**
```bash
# Get subscription ID
az account show --query id -o tsv

# Create service principal (replace SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "github-actions-crove" \
  --role contributor \
  --scopes /subscriptions/SUBSCRIPTION_ID/resourceGroups/Crove \
  --sdk-auth > azure-creds.json

# Set Azure credentials
gh secret set AZURE_CREDENTIALS < azure-creds.json --repo CroveAI/Crove

# Clean up credentials file
rm azure-creds.json
```

#### 4. Verify Secrets
```bash
gh secret list --repo CroveAI/Crove
# Should show: AZURE_CREDENTIALS, DOCKER_PASSWORD, DOCKER_USERNAME
```

### Deployment Operations

#### Manual Deployment
```bash
# Trigger deployment manually
gh workflow run "Deploy to Azure VM" --ref develop --repo CroveAI/Crove

# Check workflow status
gh run list --workflow=deploy-azure-vm.yml --repo CroveAI/Crove

# Watch workflow progress
gh run watch --repo CroveAI/Crove
```

#### Monitor Deployments
- **GitHub UI**: https://github.com/CroveAI/Crove/actions
- **CLI**: `gh run list --repo CroveAI/Crove`

### Workflow Process

1. **Build Phase**
   - Checkout code from repository
   - Setup Docker Buildx for advanced features
   - Login to Docker Hub
   - Build Docker image with production settings
   - Push to Docker Hub with tags (latest + commit SHA)

2. **Deploy Phase**
   - Login to Azure
   - Pull latest image on VM
   - Stop existing containers
   - Start new containers
   - Run database migrations
   - Perform health check

3. **Rollback (if failure)**
   - Automatically reverts to previous stable image
   - Restarts containers with stable version

## Cost Optimization

### Current Setup
- **VM**: Standard_B2s (~$30/month)
- **Storage**: Standard SSD (~$5/month)
- **Total**: ~$35/month

### Alternative: Azure Container Instances
For production, consider:
- Azure Container Instances
- Azure Kubernetes Service (AKS)
- Azure App Service

## Backup Strategy

### Automated Daily Backups
```bash
# Create backup script on VM
cat > /home/joy/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec crove-postgres pg_dump -U postgres chatwoot_production | gzip > /backups/db_$DATE.sql.gz
find /backups -name "db_*.sql.gz" -mtime +7 -delete
EOF

# Add to crontab
crontab -e
0 2 * * * /home/joy/backup.sh
```

## Contact

For issues or questions:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://docs.crove.com

---

Last Updated: September 2025