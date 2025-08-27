# frozen_string_literal: true

# Clean-room implementation for Crove feature management
# This replaces the enterprise license checking with account-based feature flags
class Api::V1::Accounts::CroveFeaturesController < Api::V1::Accounts::BaseController
  before_action :check_admin_authorization
  
  # Include both legacy and new Crove features
  PREMIUM_FEATURES = %w[
    sla
    audit_logs
    captain_integration
    custom_roles
    disable_branding
    crove_assistants
    crove_knowledge_base
    crove_advanced_sla
    crove_audit_logs
    crove_custom_roles
    crove_white_label
    crove_help_center
  ].freeze

  def index
    features = {}
    
    # Get all features with their status
    PREMIUM_FEATURES.each do |feature|
      features[feature] = {
        enabled: Current.account.feature_enabled?(feature),
        display_name: feature_display_name(feature),
        description: feature_description(feature)
      }
    end
    
    render json: { features: features }
  end

  def enable
    feature = params[:feature]
    
    if PREMIUM_FEATURES.include?(feature)
      Current.account.enable_features!(feature)
      render json: { 
        success: true, 
        message: "Feature '#{feature}' enabled successfully",
        enabled: Current.account.feature_enabled?(feature)
      }
    else
      render json: { 
        success: false, 
        message: "Invalid feature: #{feature}" 
      }, status: :unprocessable_entity
    end
  end

  def disable
    feature = params[:feature]
    
    if PREMIUM_FEATURES.include?(feature)
      Current.account.disable_features!(feature)
      render json: { 
        success: true, 
        message: "Feature '#{feature}' disabled successfully",
        enabled: Current.account.feature_enabled?(feature)
      }
    else
      render json: { 
        success: false, 
        message: "Invalid feature: #{feature}" 
      }, status: :unprocessable_entity
    end
  end

  def enable_all
    Current.account.enable_features!(*PREMIUM_FEATURES)
    render json: { 
      success: true, 
      message: 'All premium features enabled',
      features: enabled_features_list
    }
  end

  private

  def check_admin_authorization
    authorize :account, :manage_features?
  end

  def feature_display_name(feature)
    {
      'sla' => 'SLA Policies',
      'audit_logs' => 'Audit Logs',
      'captain_integration' => 'Captain AI',
      'custom_roles' => 'Custom Roles',
      'disable_branding' => 'Disable Branding',
      'crove_assistants' => 'AI Assistants',
      'crove_knowledge_base' => 'Knowledge Base (AI)',
      'crove_advanced_sla' => 'Advanced SLA',
      'crove_audit_logs' => 'Advanced Audit Logs',
      'crove_custom_roles' => 'Custom Roles & Permissions',
      'crove_white_label' => 'White Label',
      'crove_help_center' => 'Advanced Help Center'
    }[feature] || feature.humanize
  end

  def feature_description(feature)
    {
      'sla' => 'Service Level Agreement management with response time tracking',
      'audit_logs' => 'Track and trace account activities with detailed audit logs',
      'captain_integration' => 'AI-powered conversations with customers',
      'custom_roles' => 'Fine-grained permission system for agents',
      'disable_branding' => 'Remove Chatwoot branding from widget and emails',
      'crove_assistants' => 'AI-powered assistants with custom training and tools',
      'crove_knowledge_base' => 'Internal knowledge base for AI with document ingestion and RAG',
      'crove_advanced_sla' => 'Advanced SLA policies with breach detection and reporting',
      'crove_audit_logs' => 'Comprehensive audit logging with export capabilities',
      'crove_custom_roles' => 'Granular role-based access control system',
      'crove_white_label' => 'Complete white-label solution with custom branding',
      'crove_help_center' => 'Public help center with advanced search and analytics'
    }[feature] || ''
  end

  def enabled_features_list
    PREMIUM_FEATURES.select { |f| Current.account.feature_enabled?(f) }
  end
end