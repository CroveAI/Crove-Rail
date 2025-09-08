AGENTS.md

## Environment Notes

### Production/Beta Environments
- **beta.crove.com**: Hosted on Azure VM (NOT local)
  - Facebook webhook URL: https://beta.crove.com/bot (NOT /webhooks/facebook)
  - Access via SSH to Azure VM for logs/debugging
  - VM IP: 52.172.194.116
  - Resource Group: Crove
  - VM Name: Crove-Dev
  
### Local Development  
- **dev.crove.com**: Local development via Cloudflare Tunnel
  - Tunnel token in docker-compose.yaml
  - Facebook webhook URL: https://dev.crove.com/bot
  - Facebook webhooks work with dev.crove.com URL when tunnel is active

## Critical Deployment Issues & Solutions

### 1. Database Must Have Initial Data
**Problem**: Facebook webhooks received but messages not stored
**Solution**: After deployment, MUST create Account, Channel, and Inbox records in database
```bash
# See Docs/DEPLOYMENT_AZURE_VM.md step 4 for full SQL
docker exec crove-postgres psql -U postgres -d chatwoot_production < initial_data.sql
```

### 2. Facebook Webhook Configuration
- Webhook URL: `https://[domain]/bot` (NOT /webhooks/facebook)
- Verify Token: Check FB_VERIFY_TOKEN in environment
- Test verification: `curl "https://beta.crove.com/bot?hub.mode=subscribe&hub.verify_token=[token]&hub.challenge=test"`

### 3. Sidekiq Must Be Running
- Facebook messages processed by Sidekiq background jobs
- Check: `docker ps | grep sidekiq`
- Logs: `docker logs crove-sidekiq --tail 50`

### 4. ActionCable Configuration
- Fixed in `config/initializers/action_cable_production_fix.rb`
- Mount path: `/cable`
- WebSocket URL: `wss://beta.crove.com/cable`