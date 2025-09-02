puts "ENV FB_VERIFY_TOKEN: #{ENV['FB_VERIFY_TOKEN']}"
puts "GlobalConfig FB_VERIFY_TOKEN: #{GlobalConfigService.load('FB_VERIFY_TOKEN', '')}"
puts "InstallationConfig FB_VERIFY_TOKEN: #{InstallationConfig.find_by(name: 'FB_VERIFY_TOKEN')&.value}"
GlobalConfig.clear_cache
puts "After cache clear: #{GlobalConfigService.load('FB_VERIFY_TOKEN', '')}"