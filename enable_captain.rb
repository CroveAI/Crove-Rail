#!/usr/bin/env ruby

account = Account.find(1)
puts "Enabling Captain AI for: #{account.name}"

# Force enable Captain
account.limits = { agents: 999999, inboxes: 999999 }
account.custom_attributes['billing_plan'] = 'enterprise'
account.custom_attributes['captain_enabled'] = true
account.custom_attributes['plan_name'] = 'enterprise'
account.save!

# Enable feature flag
account.enable_features!('captain_integration')

# Set installation config
InstallationConfig.find_or_create_by(name: 'CAPTAIN_ENABLED').update(value: true)

puts "\n✅ Captain AI Enabled!"
puts "Billing plan: #{account.custom_attributes['billing_plan']}"
puts "Captain feature: #{account.feature_enabled?('captain_integration')}"
puts "Account limits: Agents: #{account.usage_limits[:agents]}, Inboxes: #{account.usage_limits[:inboxes]}"