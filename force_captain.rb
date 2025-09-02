#!/usr/bin/env ruby

# Force enable Captain for account with all attributes
a = Account.find(1)
a.custom_attributes['is_captain_enabled'] = true
a.custom_attributes['captain_enabled'] = true
a.custom_attributes['plan_name'] = 'enterprise'
a.custom_attributes['billing_plan'] = 'enterprise'
a.custom_attributes['captain_plan'] = 'enterprise'
a.custom_attributes['subscription_status'] = 'active'
a.save!

# Set global Captain config
configs = {
  'CAPTAIN_ENABLED' => true,
  'CAPTAIN_CLOUD_ENABLED' => true,
  'CHATWOOT_CLOUD_PLANS' => { 
    'enterprise' => { 
      'captain_enabled' => true,
      'limits' => { 'agents' => 999999 }
    }
  }.to_json
}

configs.each do |key, value|
  ic = InstallationConfig.find_or_create_by(name: key)
  ic.value = value
  ic.save!
  puts "Set #{key}"
end

# Also enable in feature flags
a.enable_features!('captain_integration')
a.enable_features!('captain_ai') rescue nil

puts "\n✅ Captain force enabled with all flags!"
puts "Account captain status: #{a.custom_attributes['captain_enabled']}"
puts "Clear browser cache and reload!"