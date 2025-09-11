#!/bin/bash

echo "Setting up Crove Docker environment..."

# Copy .env if not exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.docker .env
  echo "Please update SECRET_KEY_BASE in .env"
  echo "Run: docker exec rails bundle exec rake secret"
fi

# Stop any running containers on conflicting ports
echo "Checking for port conflicts..."
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "3007|3036"

# Remove orphan containers
echo "Cleaning up orphan containers..."
docker-compose down --remove-orphans

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 10

# Check status
echo "Checking container status..."
docker-compose ps

# Run migrations
echo "Running database migrations..."
docker exec rails bundle exec rails db:migrate

# Test Crove features
echo "Testing Crove features..."
docker exec rails bundle exec rails runner "
  account = Account.first || Account.create!(name: 'Test Account')
  puts 'Account: ' + account.name
  Crove::FeatureService.enable!(account, 'crove_assistants')
  puts 'Crove AI Assistants enabled: ' + account.feature_enabled?('crove_assistants').to_s
"

echo "Setup complete!"
echo "Access Chatwoot at: http://localhost:3007"
echo "Access Mailhog at: http://localhost:8025"