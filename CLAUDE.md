AGENTS.md

## Environment Notes

### Production/Beta Environments
- **beta.crove.com**: Hosted on Azure VM (NOT local)
  - Facebook webhook URL: https://beta.crove.com/webhooks/facebook
  - Access via SSH to Azure VM for logs/debugging
  
### Local Development  
- **dev.crove.com**: Local development via Cloudflare Tunnel
  - Tunnel token in docker-compose.yaml
  - Facebook webhooks won't work unless configured with dev.crove.com URL