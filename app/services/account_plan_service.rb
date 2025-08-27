# frozen_string_literal: true

class AccountPlanService
  class UnknownPlanError < StandardError; end

  def initialize(account:)
    @account = account
  end

  def current_plan
    plan_key = @account.custom_attributes&.fetch('plan_name', nil)&.to_s
    plan_key.presence || 'free'
  end

  def plans_config
    @plans_config ||= YAML.safe_load(Rails.root.join('config/plans.yml').read)
  end

  def plan_config(plan)
    cfg = plans_config[plan.to_s]
    raise UnknownPlanError, "Unknown plan: #{plan}" if cfg.blank?

    cfg
  end

  # Apply a plan to the account: enable/disable features and store metadata
  def apply!(plan:)
    cfg = plan_config(plan)

    # Enable configured features
    Array(cfg['features']).each do |fname|
      @account.enable_features(fname)
    end

    # Disable configured features
    Array(cfg['disabled_features']).each do |fname|
      @account.disable_features(fname)
    end

    # Persist selected plan in custom_attributes
    custom = @account.custom_attributes || {}
    custom['plan_name'] = plan.to_s
    custom['plan_display_name'] = cfg['display_name']
    custom['plan_seat_max'] = cfg.dig('seats', 'max')
    @account.custom_attributes = custom

    @account.save!

    @account
  end
end


