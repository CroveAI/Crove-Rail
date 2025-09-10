#!/bin/bash

# Database Backup Script for beta.crove.com
# Usage: ./scripts/backup-database.sh

set -e

# Configuration
BACKUP_DIR="/home/joy/backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="chatwoot_production_${TIMESTAMP}.sql"
CONTAINER_NAME="crove-postgres"
DATABASE="chatwoot_production"
USERNAME="postgres"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🗄️  Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database dump
echo -e "${YELLOW}📦 Creating backup: $BACKUP_FILE${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$USERNAME" -d "$DATABASE" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Check backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✅ Backup completed: $BACKUP_FILE ($BACKUP_SIZE)${NC}"

# Keep only last 30 backups
echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 30)...${NC}"
cd "$BACKUP_DIR"
ls -t chatwoot_production_*.sql.gz | tail -n +31 | xargs rm -f 2>/dev/null || true

# List recent backups
echo -e "${GREEN}📋 Recent backups:${NC}"
ls -lht "$BACKUP_DIR"/chatwoot_production_*.sql.gz | head -5

echo -e "${GREEN}🎉 Database backup completed successfully!${NC}"
echo -e "Backup location: $BACKUP_DIR/$BACKUP_FILE"