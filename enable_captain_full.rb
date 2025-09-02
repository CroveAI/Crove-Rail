#!/usr/bin/env ruby

puts "🚀 Enabling Captain AI with full Enterprise features..."

# Get account
account = Account.find(1)
puts "Account: #{account.name}"

# Enable Enterprise features
account.custom_attributes ||= {}
account.custom_attributes['billing_plan'] = 'enterprise'
account.custom_attributes['plan_name'] = 'enterprise' 
account.custom_attributes['subscription_status'] = 'active'
account.custom_attributes['captain_enabled'] = true
account.custom_attributes['is_captain_enabled'] = true
account.limits = { agents: 999999, inboxes: 999999 }
account.save!

# Enable Captain feature flag
account.enable_features!('captain_integration')
account.enable_features!('captain_ai') rescue nil

# Set global configs
configs = {
  'CAPTAIN_ENABLED' => 'true',
  'CAPTAIN_CLOUD_ENABLED' => 'true',
  'IS_ENTERPRISE' => 'true',
  'INSTALLATION_NAME' => 'Crove Enterprise',
  'CHATWOOT_EDITION' => 'enterprise',
  'INSTALLATION_PRICING_PLAN' => 'enterprise',
  'INSTALLATION_PRICING_PLAN_QUANTITY' => '999999'
}

configs.each do |key, value|
  ic = InstallationConfig.find_or_create_by(name: key)
  ic.value = value.to_s
  ic.save!
  puts "✓ Set #{key} = #{value}"
end

# Also set cloud plans config
cloud_plans = {
  'enterprise' => {
    'captain_enabled' => true,
    'captain_ai' => true,
    'limits' => {
      'agents' => 999999,
      'inboxes' => 999999
    }
  }
}

InstallationConfig.find_or_create_by(name: 'CHATWOOT_CLOUD_PLANS').update!(
  value: cloud_plans.to_json
)

puts "\n✅ Captain AI fully enabled!"
puts "Captain enabled: #{account.custom_attributes['captain_enabled']}"
puts "Billing plan: #{account.custom_attributes['billing_plan']}"
puts "Feature flag: #{account.feature_enabled?('captain_integration')}"
puts "\n🔄 Clear browser cache and reload!"