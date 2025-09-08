#!/bin/bash

echo "=== Deploy Sidekiq to Azure VM ==="
echo ""
echo "Since SSH is not accessible, here are the commands to run on Azure VM:"
echo ""
echo "1. Connect to Azure VM via Azure Portal Console or Bastion"
echo ""
echo "2. Check if Sidekiq is running:"
echo "   sudo docker ps | grep sidekiq"
echo ""
echo "3. If Sidekiq is NOT running, deploy it:"
cat << 'DEPLOY_SCRIPT'

# Pull the latest image
sudo docker pull joyai/crove-rails:production-cable-fix

# Stop and remove old Sidekiq if exists
sudo docker stop crove-sidekiq-1 2>/dev/null
sudo docker rm crove-sidekiq-1 2>/dev/null

# Start Sidekiq container
sudo docker run -d \
  --name crove-sidekiq-1 \
  --network crove_default \
  -e RAILS_ENV=production \
  -e SECRET_KEY_BASE=aef1e3ae6252c8f3c60af52292747bb080711bb5bc983551c6e71afec2ffa72f1cf9a93d15abe1243f7eff5b14c666cd1d6a10db1c69ce1e8c5015e5f8431d0a \
  -e FRONTEND_URL=https://beta.crove.com \
  -e REDIS_URL=redis://redis:6379/1 \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chatwoot_production \
  -e FB_APP_SECRET=$FB_APP_SECRET \
  -e FB_APP_ID=$FB_APP_ID \
  -e FB_VERIFY_TOKEN=b8620acc288ca547678063fe92ef3c4913f5a40047f9b37c37ceb1375e61dc9c \
  joyai/crove-rails:production-cable-fix \
  bundle exec sidekiq -C config/sidekiq.yml

# Check if Sidekiq started
sudo docker ps | grep sidekiq
sudo docker logs crove-sidekiq-1 --tail 20

DEPLOY_SCRIPT

echo ""
echo "4. Test Facebook webhook after Sidekiq is running:"
echo "   - Send a message to your Facebook Page"
echo "   - Check Rails logs: sudo docker logs crove-rails-1 --tail 50 | grep bot"
echo "   - Check Sidekiq logs: sudo docker logs crove-sidekiq-1 --tail 50"
echo ""
echo "5. Alternative: Use Azure CLI locally"
echo "   az vm run-command invoke \\"
echo "     --resource-group Crove \\"
echo "     --name Crove-Dev \\"
echo "     --command-id RunShellScript \\"
echo "     --scripts 'sudo docker ps | grep sidekiq'"
echo ""
echo "=== End Instructions ===">