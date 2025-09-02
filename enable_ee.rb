#!/usr/bin/env ruby

account = Account.find(1)
puts "Account: #{account.name}"

# Enable captain and other EE features
features = ['captain_integration', 'custom_roles', 'audit_logs', 'sla', 'disable_branding']
features.each do |feature|
  account.enable_features!(feature)
  puts "Enabled: #{feature}"
end

puts "\nEnabled EE features for Account 1"
puts "Captain enabled: #{account.feature_enabled?('captain_integration')}"
puts "\nAll enabled features:"
puts account.enabled_features.keys.join(", ")