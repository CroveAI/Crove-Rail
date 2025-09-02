# Crove AI Assistants Module Design

## Overview
Clean-room implementation inspired by Captain module behavior, but with independent architecture.

## Database Schema

### 1. crove_assistants
```sql
CREATE TABLE crove_assistants (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
  config JSONB DEFAULT '{}',
  instructions TEXT,
  guidelines JSONB DEFAULT '[]',
  guardrails JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  created_by_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crove_assistants_account ON crove_assistants(account_id);
CREATE INDEX idx_crove_assistants_status ON crove_assistants(status);
```

### 2. crove_knowledge_sources
```sql
CREATE TABLE crove_knowledge_sources (
  id BIGSERIAL PRIMARY KEY,
  assistant_id BIGINT NOT NULL REFERENCES crove_assistants(id) ON DELETE CASCADE,
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  source_type VARCHAR(50) NOT NULL, -- 'url', 'file', 'text', 'faq'
  source_url TEXT,
  title VARCHAR(255),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, ready, failed
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crove_knowledge_assistant ON crove_knowledge_sources(assistant_id);
CREATE INDEX idx_crove_knowledge_status ON crove_knowledge_sources(status);
```

### 3. crove_assistant_responses
```sql
CREATE TABLE crove_assistant_responses (
  id BIGSERIAL PRIMARY KEY,
  assistant_id BIGINT NOT NULL REFERENCES crove_assistants(id) ON DELETE CASCADE,
  conversation_id BIGINT REFERENCES conversations(id),
  message_id BIGINT REFERENCES messages(id),
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence_score FLOAT,
  sources_used JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crove_responses_assistant ON crove_assistant_responses(assistant_id);
CREATE INDEX idx_crove_responses_conversation ON crove_assistant_responses(conversation_id);
```

### 4. crove_assistant_scenarios
```sql
CREATE TABLE crove_assistant_scenarios (
  id BIGSERIAL PRIMARY KEY,
  assistant_id BIGINT NOT NULL REFERENCES crove_assistants(id) ON DELETE CASCADE,
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crove_scenarios_assistant ON crove_assistant_scenarios(assistant_id);
CREATE INDEX idx_crove_scenarios_enabled ON crove_assistant_scenarios(enabled);
```

### 5. crove_assistant_inboxes (junction table)
```sql
CREATE TABLE crove_assistant_inboxes (
  id BIGSERIAL PRIMARY KEY,
  assistant_id BIGINT NOT NULL REFERENCES crove_assistants(id) ON DELETE CASCADE,
  inbox_id BIGINT NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  auto_respond BOOLEAN DEFAULT false,
  confidence_threshold FLOAT DEFAULT 0.7,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(assistant_id, inbox_id)
);
```

## Models

### app/models/crove/assistant.rb
```ruby
module Crove
  class Assistant < ApplicationRecord
    self.table_name = 'crove_assistants'
    
    belongs_to :account
    belongs_to :created_by, class_name: 'User', optional: true
    has_many :knowledge_sources, dependent: :destroy
    has_many :responses, dependent: :destroy
    has_many :scenarios, dependent: :destroy
    has_many :assistant_inboxes, dependent: :destroy
    has_many :inboxes, through: :assistant_inboxes
    
    validates :name, presence: true
    validates :account_id, presence: true
    
    store_accessor :config, :temperature, :max_tokens, :welcome_message, 
                   :handoff_message, :model_provider, :api_key_id
    
    scope :active, -> { where(status: 'active') }
    scope :for_account, ->(account_id) { where(account_id: account_id) }
  end
end
```

## API Endpoints

### Assistants CRUD
- `GET    /api/v1/accounts/:account_id/crove/assistants`
- `POST   /api/v1/accounts/:account_id/crove/assistants`
- `GET    /api/v1/accounts/:account_id/crove/assistants/:id`
- `PATCH  /api/v1/accounts/:account_id/crove/assistants/:id`
- `DELETE /api/v1/accounts/:account_id/crove/assistants/:id`

### Knowledge Management
- `GET    /api/v1/accounts/:account_id/crove/assistants/:id/knowledge_sources`
- `POST   /api/v1/accounts/:account_id/crove/assistants/:id/knowledge_sources`
- `DELETE /api/v1/accounts/:account_id/crove/assistants/:id/knowledge_sources/:source_id`
- `POST   /api/v1/accounts/:account_id/crove/assistants/:id/knowledge_sources/:source_id/sync`

### Inference & Testing
- `POST   /api/v1/accounts/:account_id/crove/assistants/:id/playground`
- `POST   /api/v1/accounts/:account_id/crove/assistants/:id/infer`

### Scenarios
- `GET    /api/v1/accounts/:account_id/crove/assistants/:id/scenarios`
- `POST   /api/v1/accounts/:account_id/crove/assistants/:id/scenarios`
- `PATCH  /api/v1/accounts/:account_id/crove/assistants/:id/scenarios/:scenario_id`
- `DELETE /api/v1/accounts/:account_id/crove/assistants/:id/scenarios/:scenario_id`

## Services

### Crove::Assistants::InferenceService
```ruby
module Crove
  module Assistants
    class InferenceService
      def initialize(assistant:, conversation: nil)
        @assistant = assistant
        @conversation = conversation
      end
      
      def generate_response(message:, context: {})
        # 1. Retrieve relevant knowledge
        # 2. Build prompt with guidelines
        # 3. Call LLM API
        # 4. Post-process response
        # 5. Cache and return
      end
    end
  end
end
```

### Crove::Assistants::KnowledgeService
```ruby
module Crove
  module Assistants
    class KnowledgeService
      def initialize(assistant:)
        @assistant = assistant
      end
      
      def add_source(type:, url: nil, content: nil)
        # Create knowledge source
        # Enqueue processing job
      end
      
      def search(query:, limit: 5)
        # Vector similarity search
        # Return relevant chunks
      end
    end
  end
end
```

## Implementation Phases

### Phase 1: Basic CRUD (Day 1-2)
- [ ] Create migrations
- [ ] Implement models with validations
- [ ] Basic CRUD controllers
- [ ] API views (jbuilder)
- [ ] Feature flag integration

### Phase 2: Knowledge Management (Day 2-3)
- [ ] URL crawler service
- [ ] Text processor (chunking)
- [ ] Vector embeddings with pgvector
- [ ] Search functionality

### Phase 3: Inference Engine (Day 3-4)
- [ ] OpenAI integration
- [ ] Prompt builder
- [ ] Context management
- [ ] Response caching

### Phase 4: UI Integration (Day 4-5)
- [ ] Assistant management UI
- [ ] Knowledge source UI
- [ ] Playground/testing UI
- [ ] Inbox integration

### Phase 5: Advanced Features (Day 5-6)
- [ ] Scenarios/workflows
- [ ] Confidence scoring
- [ ] Auto-handoff logic
- [ ] Analytics/metrics

## Key Differences from Captain

1. **Multi-model support**: Not just OpenAI, but Claude, Groq, local models
2. **Flexible knowledge**: Multiple source types, incremental updates
3. **Scenario triggers**: Rule-based activation, not just instructions
4. **Confidence scoring**: Explicit confidence with thresholds
5. **Clean architecture**: Service objects, clear separation of concerns

## Security Considerations

- API key encryption (use Rails credentials)
- Rate limiting per account
- Content filtering for PII
- Audit logging for all AI operations
- Tenant isolation for knowledge

## Performance Optimizations

- Async knowledge processing
- Response caching with Redis
- Batch embeddings generation
- Connection pooling for LLM APIs
- Lazy loading of knowledge chunks