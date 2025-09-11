#!/usr/bin/env ruby
# Test script for Crove Feature Service

require_relative 'config/environment'

puts "\n=== Testing Crove Feature Service ===\n\n"

# Get first account
account = Account.first
if account.nil?
  puts "❌ No account found. Please create an account first."
  exit 1
end

puts "Testing with Account: #{account.name} (ID: #{account.id})"
puts "-" * 50

# Test 1: Check service exists
print "1. Checking Crove::FeatureService exists... "
if defined?(Crove::FeatureService)
  puts "✅"
else
  puts "❌"
  exit 1
end

# Test 2: Get all Crove features
print "2. Getting all Crove features... "
crove_features = Crove::FeatureService.crove_features
if crove_features.any?
  puts "✅ Found #{crove_features.length} features:"
  crove_features.each do |feature|
    puts "   - #{feature['name']}: #{feature['display_name']} (Premium: #{feature['premium'] ? 'Yes' : 'No'})"
  end
else
  puts "⚠️ No Crove features found in config/features.yml"
end

# Test 3: Check if features are initially disabled
puts "\n3. Checking initial feature states:"
['crove_assistants', 'crove_knowledge_base', 'crove_advanced_sla'].each do |feature|
  enabled = Crove::FeatureService.enabled?(account, feature)
  puts "   - #{feature}: #{enabled ? '✅ Enabled' : '⭕ Disabled'}"
end

# Test 4: Enable a feature
print "\n4. Enabling 'crove_assistants' feature... "
result = Crove::FeatureService.enable!(account, 'crove_assistants')
if result
  puts "✅"
  if Crove::FeatureService.enabled?(account, 'crove_assistants')
    puts "   Verification: ✅ Feature is now enabled"
  else
    puts "   Verification: ❌ Feature still disabled"
  end
else
  puts "❌ Failed to enable"
end

# Test 5: Enable multiple features
print "\n5. Enabling multiple features... "
result = Crove::FeatureService.enable!(account, 'crove_knowledge_base', 'crove_advanced_sla')
if result
  puts "✅"
  enabled_features = Crove::FeatureService.enabled_features(account)
  puts "   Enabled features: #{enabled_features.keys.select { |k| k.start_with?('crove_') }.join(', ')}"
else
  puts "❌"
end

# Test 6: Check premium access
print "\n6. Checking premium access... "
has_premium = Crove::FeatureService.has_premium_access?(account)
puts has_premium ? "✅ Has premium access" : "⭕ No premium access"

# Test 7: Disable features
print "\n7. Disabling all Crove features... "
result = Crove::FeatureService.disable_all_crove_features!(account)
if result
  puts "✅"
  enabled_count = crove_features.count { |f| account.feature_enabled?(f['name']) }
  puts "   Verification: #{enabled_count == 0 ? '✅' : '❌'} #{enabled_count} features still enabled"
else
  puts "❌"
end

# Test 8: Bulk update
print "\n8. Testing bulk update... "
features_map = {
  'crove_assistants' => true,
  'crove_knowledge_base' => true,
  'crove_advanced_sla' => false
}
result = Crove::FeatureService.update_features!(account, features_map)
if result
  puts "✅"
  puts "   - crove_assistants: #{account.feature_enabled?('crove_assistants') ? '✅' : '❌'}"
  puts "   - crove_knowledge_base: #{account.feature_enabled?('crove_knowledge_base') ? '✅' : '❌'}"
  puts "   - crove_advanced_sla: #{account.feature_enabled?('crove_advanced_sla') ? '❌ Disabled' : '✅'}"
else
  puts "❌"
end

puts "\n" + "=" * 50
puts "Testing complete!"
puts "=" * 50