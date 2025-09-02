#!/bin/bash

# Azure Web App Configuration Script
# Usage: Copy these commands and run in Azure Cloud Shell (portal.azure.com > Cloud Shell icon)

RESOURCE_GROUP="crove-rg"  # Change if different
APP_NAME="crove-dev-exdjg2e2esapbee4"

echo "Setting environment variables for $APP_NAME..."

# Basic Rails config
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
  RAILS_ENV=production \
  SECRET_KEY_BASE=aef1e3ae6252c8f3c60af52292747bb080711bb5bc983551c6e71afec2ffa72f1cf9a93d15abe1243f7eff5b14c666cd1d6a10db1c69ce1e8c5015e5f8431d0a \
  RAILS_LOG_TO_STDOUT=true \
  RAILS_SERVE_STATIC_FILES=true \
  PORT=80 \
  WEBSITE_PORT=80

# Database (update with your actual database URL)
# az webapp config appsettings set \
#   --resource-group $RESOURCE_GROUP \
#   --name $APP_NAME \
#   --settings \
#   DATABASE_URL="postgresql://user:pass@server.postgres.database.azure.com:5432/dbname?sslmode=require"

# Redis (optional)
# az webapp config appsettings set \
#   --resource-group $RESOURCE_GROUP \
#   --name $APP_NAME \
#   --settings \
#   REDIS_URL="redis://localhost:6379"

# Set startup command
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "bundle exec rails server -b 0.0.0.0 -p 80"

# Restart app
az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME

echo "Done! Check app at: https://$APP_NAME.southeastasia-01.azurewebsites.net"