#!/bin/bash

# Deploy to beta.crove.com (Azure VM)
# Usage: ./deploy-beta.sh

set -e  # Exit on error

echo "🚀 Starting deployment to beta.crove.com..."

# Configuration
VM_IP="52.172.194.116"
VM_USER="joy"
REMOTE_DIR="/home/joy/crove"
BRANCH="develop"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    print_error "SSH key not found. Please set up SSH access to Azure VM first."
    echo "Run: ssh-keygen -t rsa -b 4096"
    echo "Then add the public key to the VM"
    exit 1
fi

# Check if we can connect to VM
echo "Checking connection to Azure VM..."
if ! ssh -o ConnectTimeout=5 ${VM_USER}@${VM_IP} "echo 'Connected'" > /dev/null 2>&1; then
    print_error "Cannot connect to Azure VM at ${VM_IP}"
    echo "Please check:"
    echo "1. VM is running"
    echo "2. SSH key is added to VM"
    echo "3. Network connectivity"
    exit 1
fi
print_status "Connected to Azure VM"

# Get current branch and check for uncommitted changes
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    print_warning "You're on branch '$CURRENT_BRANCH', but deploying from '$BRANCH'"
    read -p "Do you want to switch to '$BRANCH'? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BRANCH
        git pull origin $BRANCH
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    git status --short
    read -p "Do you want to commit them first? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add -A
        git commit -m "$commit_msg"
    else
        print_warning "Deploying with uncommitted changes ignored"
    fi
fi

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin $BRANCH

# Deploy to VM
print_status "Deploying to Azure VM..."

ssh ${VM_USER}@${VM_IP} << 'ENDSSH'
set -e
cd /home/joy/crove

echo "📦 Pulling latest code..."
git fetch origin
git checkout develop
git pull origin develop

echo "🐳 Building Docker images..."
docker-compose -f docker-compose.production.yml build

echo "🔄 Restarting services..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🗄️ Running database migrations..."
docker exec crove-rails bundle exec rails db:migrate RAILS_ENV=production || true

echo "📊 Checking service status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "🔍 Checking Rails logs..."
docker logs crove-rails --tail 20

echo "✅ Health check..."
if curl -f -s -o /dev/null http://localhost:3010; then
    echo "✓ Rails is responding"
else
    echo "✗ Rails is not responding - check logs with: docker logs crove-rails"
fi

if docker exec crove-redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis is responding"
else
    echo "✗ Redis is not responding"
fi

if docker exec crove-postgres psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ PostgreSQL is responding"
else
    echo "✗ PostgreSQL is not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Site: https://beta.crove.com"
echo ""
echo "📝 Useful commands:"
echo "  View logs:        docker logs crove-rails -f"
echo "  Rails console:    docker exec -it crove-rails rails console"
echo "  Database console: docker exec -it crove-postgres psql -U postgres -d chatwoot_production"
ENDSSH

print_status "Deployment completed successfully!"
echo ""
echo "🌐 Visit: https://beta.crove.com"
echo ""
echo "📋 Post-deployment checklist:"
echo "  1. Check site is accessible"
echo "  2. Test login functionality"
echo "  3. Verify Facebook webhooks"
echo "  4. Check Sidekiq job processing"
echo ""
echo "If there are issues, SSH to VM:"
echo "  ssh ${VM_USER}@${VM_IP}"