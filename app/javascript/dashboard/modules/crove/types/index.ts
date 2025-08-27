// Crove type definitions

export interface CroveFeature {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  premium: boolean;
}

export interface CroveAccount {
  id: number;
  name: string;
  features: Record<string, boolean>;
  plan?: 'free' | 'starter' | 'growth' | 'enterprise';
}

export interface CroveAssistant {
  id: string;
  accountId: number;
  name: string;
  description?: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CroveKnowledgeSource {
  id: string;
  accountId: number;
  kind: 'website' | 'file' | 'text' | 'api';
  config: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CroveSLAPolicy {
  id: string;
  accountId: number;
  name: string;
  description?: string;
  firstResponseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  businessHours?: boolean;
  conditions?: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CroveAuditLog {
  id: string;
  accountId: number;
  actorId: number;
  actorType: 'user' | 'system' | 'api';
  targetType: string;
  targetId: string;
  action: string;
  diff?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CroveRole {
  id: string;
  accountId: number;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CroveHelpArticle {
  id: string;
  portalId: string;
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  helpful: number;
  notHelpful: number;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}