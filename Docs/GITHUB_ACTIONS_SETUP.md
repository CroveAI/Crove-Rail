# GitHub Actions CI/CD Setup for Azure VM

## Overview
Automated deployment pipeline from GitHub to Azure VM using GitHub Actions.

## Prerequisites

### 1. Docker Hub Credentials
Create secrets in GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add:
  - `DOCKER_USERNAME`: Your Docker Hub username (e.g., `joyai`)
  - `DOCKER_PASSWORD`: Your Docker Hub password or access token

### 2. Azure Service Principal
Create Azure credentials for GitHub Actions:

```bash
# Create service principal
az ad sp create-for-rbac --name "github-actions-crove" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/Crove \
  --sdk-auth
```

This will output JSON like:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  "activeDirectoryEndpointUrl": "xxx",
  "resourceManagerEndpointUrl": "xxx",
  "activeDirectoryGraphResourceId": "xxx",
  "sqlManagementEndpointUrl": "xxx",
  "galleryEndpointUrl": "xxx",
  "managementEndpointUrl": "xxx"
}
```

Add this entire JSON as `AZURE_CREDENTIALS` secret in GitHub.

## Workflow Features

### Automatic Triggers
- Push to `main` branch → Deploy to production (beta.crove.com)
- Push to `develop` branch → Deploy to staging
- Manual trigger via GitHub Actions UI

### Build Optimization
- Docker layer caching for faster builds
- Multi-stage builds
- Tagged with commit SHA for rollback

### Deployment Process
1. Build Docker image
2. Push to Docker Hub
3. Deploy to Azure VM
4. Run database migrations
5. Health check
6. Automatic rollback on failure

### Security
- Secrets stored in GitHub Secrets
- No credentials in code
- Azure RBAC for VM access

## Usage

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy to Azure VM"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

### Automatic Deployment
Simply push to `main` or `develop`:
```bash
git push origin main
```

### Monitor Deployment
1. Go to Actions tab
2. Click on running workflow
3. View real-time logs

## Rollback

### Automatic Rollback
If health check fails, automatically rolls back to `stable` tag.

### Manual Rollback
```bash
# SSH to VM
ssh joy@<vm-ip>

# Rollback to previous image
docker pull joyai/crove-rails:stable
docker-compose -f docker-compose.production.yml down
docker tag joyai/crove-rails:stable joyai/crove-rails:latest
docker-compose -f docker-compose.production.yml up -d
```

## Environment Variables

Update these in workflow file if needed:
- `DOCKER_IMAGE`: Docker Hub image name
- `AZURE_RG`: Azure Resource Group
- `AZURE_VM`: Azure VM name

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Verify Docker Hub credentials
- Check build logs in Actions tab

### Deployment Fails
- Verify Azure credentials
- Check VM is running
- Verify docker-compose.production.yml exists on VM

### Health Check Fails
- Check Rails logs: `docker logs crove-rails`
- Verify port 3010 is accessible
- Check database connection

## Best Practices

1. **Test locally first**
   ```bash
   docker build -t test -f docker/Dockerfile .
   docker-compose -f docker-compose.production.yml up
   ```

2. **Use staging branch**
   - Deploy to staging first
   - Test thoroughly
   - Then merge to main

3. **Tag stable releases**
   ```bash
   docker tag joyai/crove-rails:latest joyai/crove-rails:stable
   docker push joyai/crove-rails:stable
   ```

4. **Monitor after deployment**
   - Check application logs
   - Monitor performance
   - Verify all features work

## Next Steps

### Advanced Features to Add
1. **Slack/Email notifications**
2. **Database backup before migration**
3. **Blue-green deployment**
4. **Performance testing**
5. **Security scanning**

### Example: Add Slack Notification
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

## Support

For issues:
- Check GitHub Actions logs
- Review Azure VM logs
- Contact DevOps team

---

Last Updated: September 2025