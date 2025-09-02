#!/usr/bin/env ruby

puts "🧹 Cleaning and fixing Captain configuration..."

# Fix account first
account = Account.find(1)
puts "Fixing account: #{account.name}"

# Reset and set proper attributes
account.custom_attributes = {
  'billing_plan' => 'enterprise',
  'plan_name' => 'enterprise',
  'subscription_status' => 'active',
  'captain_enabled' => true,
  'is_captain_enabled' => true
}
account.limits = { agents: 999999, inboxes: 999999 }
account.save!

# Enable features
account.enable_features!('captain_integration')
puts "✓ Account fixed"

# Clean broken InstallationConfig records
puts "\nCleaning InstallationConfig..."
broken_configs = ['CAPTAIN_ENABLED', 'CAPTAIN_CLOUD_ENABLED', 'IS_ENTERPRISE', 
                  'CHATWOOT_EDITION', 'INSTALLATION_PRICING_PLAN', 
                  'INSTALLATION_PRICING_PLAN_QUANTITY', 'CHATWOOT_CLOUD_PLANS']

broken_configs.each do |key|
  begin
    ic = InstallationConfig.find_by(name: key)
    if ic
      ic.destroy!
      puts "✓ Deleted broken config: #{key}"
    end
  rescue => e
    puts "⚠ Error with #{key}: #{e.message}"
  end
end

# Create fresh configs
puts "\nCreating fresh configs..."
configs = {
  'CAPTAIN_ENABLED' => 'true',
  'IS_ENTERPRISE' => 'true',
  'CHATWOOT_EDITION' => 'enterprise'
}

configs.each do |key, value|
  begin
    InstallationConfig.create!(name: key, value: value)
    puts "✓ Created: #{key} = #{value}"
  rescue => e
    puts "⚠ Error creating #{key}: #{e.message}"
  end
end

puts "\n✅ Captain configuration fixed!"
puts "Captain enabled: #{account.custom_attributes['captain_enabled']}"
puts "Billing plan: #{account.custom_attributes['billing_plan']}"
puts "Feature: #{account.feature_enabled?('captain_integration')}"
puts "\n🔄 Clear browser cache and reload!"