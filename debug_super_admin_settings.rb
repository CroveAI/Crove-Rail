#!/usr/bin/env ruby
# Debug script for super admin settings update issue on production
# Run with: docker compose exec rails rails runner debug_super_admin_settings.rb

puts "=" * 60
puts "DEBUG: Super Admin Settings Configuration"
puts "=" * 60

# Check environment
puts "\n1. Environment:"
puts "   RAILS_ENV: #{Rails.env}"
puts "   Database: #{ActiveRecord::Base.connection.current_database}"

# Check InstallationConfig table
puts "\n2. Current InstallationConfig records:"
configs = InstallationConfig.all
configs.each do |config|
  puts "   - #{config.name}: locked=#{config.locked}, value=#{config.value.to_s[0..50]}..."
end

# Test creating/updating a config
puts "\n3. Testing InstallationConfig update:"
test_key = "TEST_DEBUG_KEY"
test_value = "test_value_#{Time.now.to_i}"

begin
  # Try to create or update
  config = InstallationConfig.where(name: test_key).first_or_create(value: test_value, locked: false)
  config.value = test_value
  config.save!
  
  puts "   ✓ Created/Updated: #{test_key} = #{test_value}"
  puts "   Locked status: #{config.locked}"
  puts "   Persisted: #{config.persisted?}"
  
  # Verify it was saved
  reloaded = InstallationConfig.find_by(name: test_key)
  if reloaded
    puts "   ✓ Verified in DB: value=#{reloaded.value}, locked=#{reloaded.locked}"
  else
    puts "   ✗ Could not find in DB after save!"
  end
  
  # Check Redis cache
  cache_key = "#{GlobalConfig::VERSION}:#{GlobalConfig::KEY_PREFIX}:#{test_key}"
  cached_value = $alfred.with { |conn| conn.get(cache_key) }
  if cached_value
    puts "   Redis cache: #{cached_value}"
  else
    puts "   Redis cache: empty (will be loaded on first access)"
  end
  
  # Clean up test record
  config.destroy
  puts "   ✓ Cleaned up test record"
  
rescue => e
  puts "   ✗ Error: #{e.message}"
  puts "   Backtrace:"
  e.backtrace.first(5).each { |line| puts "     #{line}" }
end

# Check permissions
puts "\n4. Database permissions check:"
begin
  ActiveRecord::Base.connection.execute("SELECT current_user, current_database();").each do |row|
    puts "   Current user: #{row['current_user']}"
    puts "   Current database: #{row['current_database']}"
  end
  
  # Check if we can write to the table
  result = ActiveRecord::Base.connection.execute("SELECT has_table_privilege('installation_configs', 'INSERT');")
  puts "   INSERT privilege: #{result.first['has_table_privilege']}"
  
  result = ActiveRecord::Base.connection.execute("SELECT has_table_privilege('installation_configs', 'UPDATE');")
  puts "   UPDATE privilege: #{result.first['has_table_privilege']}"
rescue => e
  puts "   Could not check permissions: #{e.message}"
end

# Check for any validations or callbacks that might interfere
puts "\n5. Model callbacks and validations:"
puts "   Callbacks:"
InstallationConfig._create_callbacks.each do |callback|
  puts "     - #{callback.filter}"
end
puts "   Validations:"
InstallationConfig.validators.each do |validator|
  puts "     - #{validator.class.name}: #{validator.attributes}"
end

puts "\n" + "=" * 60
puts "DEBUG COMPLETE"
puts "=" * 60