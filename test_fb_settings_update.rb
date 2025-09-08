#!/usr/bin/env ruby
# Test Facebook settings update on production
# Run with: docker compose exec rails rails runner test_fb_settings_update.rb

puts "=" * 60
puts "Testing Facebook Settings Update"
puts "=" * 60

# Facebook config keys
fb_configs = %w[FB_APP_ID FB_VERIFY_TOKEN FB_APP_SECRET IG_VERIFY_TOKEN]

puts "\n1. Current Facebook settings:"
fb_configs.each do |key|
  config = InstallationConfig.find_by(name: key)
  if config
    value_display = key.include?('SECRET') ? '***' : (config.value.to_s[0..30] || 'nil')
    puts "   #{key}: #{value_display}... (locked: #{config.locked})"
  else
    puts "   #{key}: NOT SET"
  end
end

puts "\n2. Attempting to update FB_VERIFY_TOKEN:"
test_token = "crove_verify_token_2024"

begin
  config = InstallationConfig.where(name: 'FB_VERIFY_TOKEN').first_or_create(value: test_token, locked: false)
  old_value = config.value
  config.value = test_token
  
  if config.save
    puts "   ✓ Save returned true"
    puts "   Old value: #{old_value}"
    puts "   New value: #{config.value}"
    puts "   Locked: #{config.locked}"
    
    # Verify by reloading
    config.reload
    puts "   After reload: #{config.value}"
    
    # Check if it's accessible via GlobalConfig
    global_value = GlobalConfig.get_value('FB_VERIFY_TOKEN')
    puts "   GlobalConfig value: #{global_value}"
    
    # Clear cache and check again
    GlobalConfig.clear_cache
    global_value_after_clear = GlobalConfig.get_value('FB_VERIFY_TOKEN')
    puts "   GlobalConfig after cache clear: #{global_value_after_clear}"
  else
    puts "   ✗ Save failed!"
    puts "   Errors: #{config.errors.full_messages.join(', ')}"
  end
rescue => e
  puts "   ✗ Error: #{e.message}"
  puts "   #{e.backtrace.first(3).join("\n   ")}"
end

puts "\n3. Checking database directly:"
result = ActiveRecord::Base.connection.execute(
  "SELECT name, serialized_value, locked, updated_at FROM installation_configs WHERE name = 'FB_VERIFY_TOKEN'"
)
result.each do |row|
  puts "   DB Record: #{row.inspect}"
end

puts "\n" + "=" * 60