# Quick Deployment Guide - beta.crove.com

## 🚀 Quick Deploy (Manual)

### Option 1: Use Deployment Script (Recommended)
```bash
./deploy-beta.sh
```

This script will:
- Check SSH connection to Azure VM
- Push code to GitHub
- Deploy to VM via SSH
- Run migrations
- Health check services

### Option 2: Manual SSH Deployment
```bash
# 1. SSH to Azure VM
ssh joy@52.172.194.116

# 2. Navigate to project
cd /home/joy/crove

# 3. Pull latest code
git pull origin develop

# 4. Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# 5. Run migrations
docker exec crove-rails bundle exec rails db:migrate RAILS_ENV=production

# 6. Check status
docker ps
docker logs crove-rails --tail 50
```

## 🤖 Automated Deployment (GitHub Actions)

### Setup (One-time)

1. **Add Docker Hub credentials to GitHub Secrets:**
   - Go to: https://github.com/CroveAI/Crove/settings/secrets/actions
   - Add `DOCKER_PASSWORD`: Your Docker Hub password/token

2. **Add Azure credentials:**
   ```bash
   # Generate Azure service principal
   az ad sp create-for-rbac --name "github-actions-crove" \
     --role contributor \
     --scopes /subscriptions/{your-subscription-id}/resourceGroups/Crove \
     --sdk-auth
   ```
   - Copy the JSON output
   - Add as `AZURE_CREDENTIALS` secret in GitHub

3. **Deploy automatically:**
   - Push to `develop` branch → Deploys to beta.crove.com
   - Push to `main` branch → Deploys to production (when ready)

### Manual Trigger
1. Go to: https://github.com/CroveAI/Crove/actions
2. Click "Deploy to Azure VM"
3. Click "Run workflow"
4. Select branch and run

## 📋 Pre-deployment Checklist

- [ ] Test locally: `docker-compose up`
- [ ] Run tests: `docker exec rails bundle exec rspec`
- [ ] Check migrations: `docker exec rails bundle exec rails db:migrate:status`
- [ ] Commit all changes
- [ ] Push to GitHub

## 🔍 Post-deployment Verification

1. **Check site:** https://beta.crove.com
2. **Test login:** Use existing credentials
3. **Check logs:**
   ```bash
   ssh joy@52.172.194.116
   docker logs crove-rails -f
   docker logs sidekiq -f
   ```
4. **Verify Facebook webhooks:**
   - Send test message to Facebook page
   - Check if appears in Chatwoot

## 🚨 Troubleshooting

### Can't SSH to VM
```bash
# Check VM status in Azure Portal
# Or restart VM:
az vm restart --resource-group Crove --name Crove-Dev
```

### Site not accessible
```bash
# SSH to VM and check:
docker ps  # All containers running?
docker logs crove-rails --tail 100  # Any errors?
docker logs crove-nginx --tail 100  # Nginx errors?
```

### Database issues
```bash
# Reset database (CAUTION: Will lose data)
docker exec crove-rails bundle exec rails db:drop db:create db:migrate db:seed RAILS_ENV=production
```

### Rollback deployment
```bash
# On VM:
cd /home/joy/crove
git checkout HEAD~1  # Previous commit
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml restart
```

## 📞 Support

- **Azure VM IP:** 52.172.194.116
- **Resource Group:** Crove
- **VM Name:** Crove-Dev
- **Domain:** beta.crove.com
- **Ports:** 80 (HTTP), 443 (HTTPS)

## 🔑 Important Files on VM

- `/home/joy/crove/` - Application code
- `/home/joy/crove/docker-compose.production.yml` - Docker config
- `/home/joy/crove/.env` - Environment variables
- `/etc/nginx/sites-available/crove` - Nginx config
- `/var/log/nginx/` - Nginx logs