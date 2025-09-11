# Crove Development Guide

## Repository Setup

### Fork Strategy
- **Fork from**: `chatwoot/chatwoot:develop` branch
- **Main branch**: `develop` 
- **Production branch**: `master` (for stable releases)
- **Why develop?**: Chatwoot uses Git Flow - develop branch contains latest features, master only has stable releases

### Syncing with Upstream

```bash
# Add upstream remote (if not already added)
git remote add upstream https://github.com/chatwoot/chatwoot.git

# Fetch latest changes
git fetch upstream

# Merge upstream/develop into local develop
git checkout develop
git merge upstream/develop

# Resolve conflicts (prefer upstream for Chatwoot core files)
git checkout --theirs <conflicted-files>
git add .
git commit -m "Merge upstream/develop into develop branch"

# Push to origin
git push origin develop
```

## Environment Setup

### Local Development
- **URL**: dev.crove.com (via Cloudflare Tunnel)
- **Rails**: Port 3015
- **Vite**: Port 3036
- **Database**: PostgreSQL (crove_dev)
- **Redis**: Default port

### Production/Beta
- **URL**: beta.crove.com
- **Hosting**: Azure VM
- **Deployment**: GitHub Actions CI/CD
- **Facebook Webhooks**: https://beta.crove.com/webhooks/facebook

## Docker Development

### Container Setup
```yaml
Services:
  - rails: Main application
  - sidekiq: Background jobs
  - postgres: Database (DB)
  - redis: Cache & ActionCable
  - cloudflared: Tunnel for local development
```

### Common Commands
```bash
# Start all services
docker-compose up

# Rails console
docker-compose exec rails rails console

# Database migrations
docker-compose exec rails rails db:migrate

# View logs
docker-compose logs -f rails
docker-compose logs -f sidekiq
```

## Git Workflow

### Branch Naming
- Features: `feature/description`
- Fixes: `fix/description`
- Chores: `chore/description`

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `chore:` Maintenance tasks
- `refactor:` Code refactoring

### Merging Upstream Changes
1. Always fetch and merge from `upstream/develop`
2. Resolve conflicts preferring upstream for core Chatwoot files
3. Keep Crove-specific changes isolated in:
   - `/app/services/crove/`
   - `/app/controllers/api/v1/accounts/crove_*`
   - `/app/javascript/dashboard/modules/crove/`
   - Custom configuration files

## Feature Development

### Module Structure Patterns

#### Pattern 1: Simple Modules (Single File)
For small features, use single files in existing directories:
```
store/modules/croveFeature.js     # Vuex store
api/croveFeature.js               # API client
```

#### Pattern 2: Complex/EE Modules (Folder Structure)
For large features like AI, CRM, Analytics, use dedicated folders:
```
app/javascript/dashboard/
├── api/
│   └── module-name/           # API clients folder
│       ├── resource1.js
│       └── resource2.js
├── store/
│   └── module-name/           # Vuex store folder
│       ├── actions.js
│       └── mutations.js
├── routes/dashboard/
│   └── module-name/           # Routes & Views folder
│       ├── components/
│       └── module.routes.js
└── components/
    └── module-name/           # Shared components
```

### Crove-Specific Features
Located in dedicated directories:
- Backend: `/app/services/crove/`, `/app/controllers/api/v1/accounts/crove_*`
- Frontend: `/app/javascript/dashboard/modules/crove/` (deprecated)
- Tests: `/spec/services/crove/`, `/spec/controllers/api/v1/accounts/crove_*`

### Crove EE Modules Organization

To avoid scattered files when implementing multiple EE replacement modules, use this structure:

#### Option 1: Namespace by Module (RECOMMENDED)
```
app/javascript/dashboard/
├── api/
│   ├── crove-ai/              # AI Assistant module
│   ├── crove-analytics/       # Analytics module
│   └── crove-audit/           # Audit logs module
├── store/
│   ├── crove-ai/
│   ├── crove-analytics/
│   └── crove-audit/
├── routes/dashboard/
│   ├── crove-ai/
│   ├── crove-analytics/
│   └── crove-audit/
└── components/
    ├── crove-ai/
    ├── crove-analytics/
    └── crove-audit/
```

#### Option 2: Centralized Crove Directory
```
app/javascript/dashboard/crove/   # All Crove modules in one place
├── ai/
│   ├── api/
│   ├── store/
│   ├── routes/
│   └── components/
├── analytics/
│   ├── api/
│   ├── store/
│   ├── routes/
│   └── components/
└── shared/                       # Shared utilities
    ├── composables/
    └── types/
```

**Recommendation**: Use Option 1 (namespace by module) as it follows Chatwoot's existing pattern (like Captain module) and makes it easier to:
- Enable/disable features via feature flags
- Remove modules if needed
- Maintain consistency with Chatwoot structure

### Feature Flags
Configured in `config/features.yml`:
- `crove_assistants` - AI Assistants
- `crove_knowledge_base` - Knowledge Base (AI)
- `crove_advanced_sla` - Advanced SLA
- `crove_audit_logs` - Advanced Audit Logs
- `crove_custom_roles` - Custom Roles & Permissions
- `crove_white_label` - White Label
- `crove_help_center` - Advanced Help Center

### Clean-room Implementation Principles
1. No code copying from `enterprise/` directory
2. Feature behavior inspired by enterprise features
3. Independent implementation with compatible APIs
4. Use feature flags instead of pricing plans

## Testing

### Running Tests
```bash
# All tests
docker-compose exec rails rspec

# Specific test file
docker-compose exec rails rspec spec/services/crove/feature_service_spec.rb

# With coverage
docker-compose exec rails COVERAGE=true rspec
```

### API Testing
```bash
# Test feature flags API
./test_crove_features.sh

# Test with curl
curl -H "api_access_token: YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3015/api/v1/accounts/1/crove_features
```

## Deployment

### GitHub Actions Workflow
Automated deployment to Azure VM on push to `develop` branch:
1. Build Docker image
2. Push to Docker Hub
3. SSH to Azure VM
4. Pull and restart containers

### Manual Deployment
```bash
# Build production image
docker build -t joyai/crove-rails:production -f docker/Dockerfile .

# Push to registry
docker push joyai/crove-rails:production

# On production server
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### Pre-commit Hook Failures
```bash
# Skip hooks temporarily
git commit --no-verify
```

#### Database Connection Issues
```bash
# Reset database
docker-compose exec rails rails db:drop db:create db:migrate db:seed
```

#### Asset Compilation Issues
```bash
# Clear cache and recompile
docker-compose exec rails rails assets:clobber
docker-compose exec rails rails assets:precompile
```

## Important Files

### Configuration
- `docker-compose.yml` - Docker services configuration
- `.env` - Environment variables
- `config/database.yml` - Database configuration
- `config/features.yml` - Feature flags

### Crove-Specific
- `/Docs/CROVE_CHANGELOG.md` - Development changelog
- `/Docs/EE-CLEANROOM-PLAN.md` - Feature implementation roadmap
- `/CLAUDE.md` - AI assistant instructions

## Security Notes

### Sensitive Files (gitignored)
- `azure-creds.json`
- `deploy_azure_fix.sh`
- `.env` files
- SSL certificates
- API keys and tokens

### Production Secrets
Managed via environment variables, never commit:
- Database credentials
- API keys (OpenAI, Facebook, etc.)
- Secret key base
- Cloud provider credentials