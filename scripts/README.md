# Crove Scripts

## Ruby Scripts

### enable_ee.rb
Enable Enterprise Edition features for an account:
```bash
docker exec rails bundle exec rails runner scripts/enable_ee.rb
```

### test_crove_features.rb  
Test Crove feature flags system:
```bash
# Test all features
docker exec rails ruby scripts/test_crove_features.rb

# Enable all features for account 1
docker exec rails ruby scripts/test_crove_features.rb enable_all
```

## Shell Scripts

### backup-database.sh
Backup PostgreSQL database before deployment

### restore-database.sh
Restore database from backup

### safe-deploy.sh
Deploy to Azure VM with database backup