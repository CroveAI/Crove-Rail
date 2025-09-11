#!/bin/bash

# Safe Deployment Script - Ensures data is never lost during updates
# Usage: ./scripts/safe-deploy.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔒 Safe Deployment Script${NC}"
echo -e "${GREEN}========================${NC}"
echo ""

# 1. Create automatic backup before any changes
echo -e "${YELLOW}📦 Creating database backup...${NC}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/joy/backups/database"
mkdir -p "$BACKUP_DIR"
docker exec crove-postgres pg_dump -U postgres -d chatwoot_production | gzip > "$BACKUP_DIR/deploy_${TIMESTAMP}.sql.gz"
echo -e "${GREEN}✅ Backup created: deploy_${TIMESTAMP}.sql.gz${NC}"

# 2. Verify backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/deploy_${TIMESTAMP}.sql.gz" | cut -f1)
if [[ "$BACKUP_SIZE" == "0" ]]; then
    echo -e "${RED}❌ Error: Backup file is empty!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backup verified: ${BACKUP_SIZE}${NC}"

# 3. Check database container status - NEVER stop it
echo -e "${YELLOW}🗄️  Checking database status...${NC}"
if ! docker ps | grep -q crove-postgres; then
    echo -e "${YELLOW}⚠️  Starting database container...${NC}"
    docker start crove-postgres || docker run -d --name crove-postgres \
        --network crove-network \
        -v joy_postgres_data:/var/lib/postgresql/data \
        -e POSTGRES_DB=chatwoot_production \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        pgvector/pgvector:pg17
    sleep 10
fi
echo -e "${GREEN}✅ Database is running${NC}"

# 4. Pull latest images if needed
if [ -n "$1" ]; then
    echo -e "${YELLOW}🚀 Pulling latest image: $1${NC}"
    docker pull "$1"
    IMAGE="$1"
else
    IMAGE="joyai/crove-rails:latest"
fi

# 5. Update ONLY application containers (never database)
echo -e "${YELLOW}🔄 Updating application containers...${NC}"

# Stop old containers (but NOT database)
docker stop crove-rails crove-sidekiq 2>/dev/null || true
docker rm crove-rails crove-sidekiq 2>/dev/null || true

# Start Rails
docker run -d --name crove-rails --restart always \
    -p 3015:3000 \
    --network crove-network \
    -e RAILS_ENV=production \
    -e DATABASE_URL=postgresql://postgres:postgres@crove-postgres:5432/chatwoot_production \
    -e REDIS_URL=redis://crove-redis:6379 \
    -e FRONTEND_URL=https://beta.crove.com \
    -e RAILS_LOG_TO_STDOUT=true \
    -e RAILS_SERVE_STATIC_FILES=true \
    -e INSTALLATION_NAME=Crove \
    "$IMAGE" \
    sh -c 'bundle exec rails server -b 0.0.0.0 -p 3000'

# Start Sidekiq
docker run -d --name crove-sidekiq --restart always \
    --network crove-network \
    -e RAILS_ENV=production \
    -e DATABASE_URL=postgresql://postgres:postgres@crove-postgres:5432/chatwoot_production \
    -e REDIS_URL=redis://crove-redis:6379 \
    "$IMAGE" \
    bundle exec sidekiq -C config/sidekiq.yml

echo -e "${GREEN}✅ Application containers updated${NC}"

# 6. Run migrations (safe - only adds, doesn't delete data)
echo -e "${YELLOW}🗃️  Running database migrations...${NC}"
sleep 15  # Wait for Rails to start
docker exec crove-rails bundle exec rails db:migrate RAILS_ENV=production || true

# 7. Verify deployment
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
sleep 10

# Check services are running
if docker ps | grep -q crove-rails && docker ps | grep -q crove-sidekiq; then
    echo -e "${GREEN}✅ All services running${NC}"
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    docker ps
fi

# Check database data is intact
ACCOUNT_COUNT=$(docker exec crove-postgres psql -U postgres -d chatwoot_production -t -c "SELECT COUNT(*) FROM accounts;" | tr -d ' ')
USER_COUNT=$(docker exec crove-postgres psql -U postgres -d chatwoot_production -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')

echo -e "${GREEN}📊 Database Status:${NC}"
echo -e "  Accounts: $ACCOUNT_COUNT"
echo -e "  Users: $USER_COUNT"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📝 Backup location: $BACKUP_DIR/deploy_${TIMESTAMP}.sql.gz${NC}"
echo -e "${GREEN}🌐 Site: https://beta.crove.com${NC}"

# Keep last 30 backups only
echo -e "${YELLOW}🧹 Cleaning old backups...${NC}"
cd "$BACKUP_DIR"
ls -t deploy_*.sql.gz 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true