#!/bin/bash

# Database Restore Script for beta.crove.com
# Usage: ./scripts/restore-database.sh <backup_file>

set -e

# Configuration
CONTAINER_NAME="crove-postgres"
DATABASE="chatwoot_production"
USERNAME="postgres"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Please provide backup file path${NC}"
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /home/joy/backups/database/chatwoot_production_20250910_143000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will completely replace the current database!${NC}"
echo -e "${YELLOW}Current database will be PERMANENTLY LOST!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}✅ Operation cancelled.${NC}"
    exit 0
fi

echo -e "${GREEN}🗄️  Starting database restore...${NC}"

# Stop Rails to prevent connections
echo -e "${YELLOW}🛑 Stopping Rails container...${NC}"
docker stop crove-rails || true
docker stop crove-sidekiq || true

# Drop existing database and recreate
echo -e "${YELLOW}🗑️  Dropping existing database...${NC}"
docker exec "$CONTAINER_NAME" dropdb -U "$USERNAME" --if-exists "$DATABASE"
docker exec "$CONTAINER_NAME" createdb -U "$USERNAME" "$DATABASE"

# Restore from backup
echo -e "${YELLOW}📥 Restoring from backup...${NC}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed backup
    gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$USERNAME" -d "$DATABASE"
else
    # Uncompressed backup
    docker exec -i "$CONTAINER_NAME" psql -U "$USERNAME" -d "$DATABASE" < "$BACKUP_FILE"
fi

# Restart Rails
echo -e "${YELLOW}🚀 Starting Rails container...${NC}"
docker start crove-rails
docker start crove-sidekiq

# Wait for Rails to be ready
echo -e "${YELLOW}⏳ Waiting for Rails to be ready...${NC}"
sleep 10

# Verify restore
echo -e "${YELLOW}✅ Verifying restore...${NC}"
ACCOUNT_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$USERNAME" -d "$DATABASE" -t -c "SELECT COUNT(*) FROM accounts;" | tr -d ' ')
USER_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$USERNAME" -d "$DATABASE" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
MESSAGE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$USERNAME" -d "$DATABASE" -t -c "SELECT COUNT(*) FROM messages;" | tr -d ' ')

echo -e "${GREEN}📊 Database restored successfully!${NC}"
echo -e "Accounts: $ACCOUNT_COUNT"
echo -e "Users: $USER_COUNT"
echo -e "Messages: $MESSAGE_COUNT"

echo -e "${GREEN}🎉 Database restore completed!${NC}"
echo -e "You can now access: https://beta.crove.com"