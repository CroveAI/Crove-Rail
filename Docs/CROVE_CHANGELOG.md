# Crove Development Changelog

## 2025-08-28 - Docker Development Environment Fixed

### Fixed
- **Redirect Loop Issue**: Added `/app/` route to dashboard router to prevent infinite redirect loop between login and dashboard in Docker development environment
  - Root cause: JavaScript router loaded before Rails could handle the route in Docker setup
  - Solution: Dynamic redirect to user's account dashboard from `/app/` path
  
- **Vite WebSocket Connection**: Fixed WebSocket connection issues for HMR
  - Changed `VITE_RUBY_HOST` to `VITE_DEV_SERVER_HOST` (correct env variable name)
  - Configured proper host settings for Docker environment

- **Database Configuration**: 
  - Renamed development database from `chatwoot_development` to `crove_dev`
  - Set production database name to `crove`
  - Created proper user accounts and permissions

### Environment Setup
- PostgreSQL container: `DB` 
- Redis container: `redis`
- Rails on port: `3015`
- Vite dev server on port: `3036`
- All services on `Gateway` network

### User Accounts Created
- `joy@joy.vn` - Super Admin (Account ID: 3)
- `joy@crove.com` - Super Admin (Account IDs: 1, 2)

---

## 2024-12-24 - Feature Flags System ✅

**Completed clean-room implementation of Feature Flags module**

### Backend Implementation
- ✅ Leveraged existing `Featurable` concern from Chatwoot (no new tables)
- ✅ Added 7 Crove features to `config/features.yml`:
  - `crove_assistants` - AI Assistants
  - `crove_knowledge_base` - Knowledge Base (AI) 
  - `crove_advanced_sla` - Advanced SLA
  - `crove_audit_logs` - Advanced Audit Logs
  - `crove_custom_roles` - Custom Roles & Permissions
  - `crove_white_label` - White Label
  - `crove_help_center` - Advanced Help Center
- ✅ Service wrapper: `app/services/crove/feature_service.rb`
- ✅ API controller: `app/controllers/api/v1/accounts/crove_features_controller.rb`
- ✅ Routes configured in `config/routes.rb`
- ✅ RSpec tests: `spec/services/crove/feature_service_spec.rb`

### Frontend Implementation
- ✅ TypeScript module in `app/javascript/dashboard/modules/crove/`
  - `api/features.ts` - API client
  - `composables/useFeatures.ts` - Vue composable  
  - `types/index.ts` - Type definitions
  - `index.ts` - Module exports
- ✅ Updated `featureFlags.js` with CROVE_FEATURES constants
- ✅ Added to PREMIUM_FEATURES array

### Testing
- ✅ Ruby test script: `test_crove_features.rb`
- ✅ API test script: `test_crove_features.sh`
- ✅ RSpec test suite

---

## Roadmap (From EE-CLEANROOM-PLAN)

### Phase 1: Foundation (Current)
- [x] Feature Flags System
- [ ] AI Assistants v1 (CRUD + OpenAI inference)
- [ ] Knowledge Base (crawl, embeddings, RAG)

### Phase 2: Operations
- [ ] SLA Policies + Reports
- [ ] Audit Logs
- [ ] Custom Roles & Permissions

### Phase 3: Customer Experience
- [ ] Help Center CMS
- [ ] White Label / Disable Branding
- [ ] Advanced Analytics

### Phase 4: AI Enhancement
- [ ] Multi-model support (Claude, Groq, local)
- [ ] Advanced RAG with pgvector
- [ ] Intent classification & auto-triage
- [ ] Conversation summarization

## Technical Decisions

### Clean-room Principles
- No code copying from `enterprise/` directory
- Feature behavior inspired by enterprise features
- Independent implementation with compatible APIs
- Feature flags instead of pricing plans

### Architecture
- PostgreSQL + pgvector for embeddings
- Sidekiq for background jobs
- Redis for caching
- Docker for development environment
- Vite for frontend build

### AI Stack (Planned)
- OpenAI API for initial implementation
- pgvector for vector storage
- RAG pipeline for knowledge retrieval
- Fallback to human agents when confidence low