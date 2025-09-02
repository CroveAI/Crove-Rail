#!/usr/bin/env ruby

# Set Captain configs
configs = {
  'CAPTAIN_OPEN_AI_API_KEY' => 'sk-proj-test',
  'CAPTAIN_OPEN_AI_MODEL' => 'gpt-4',
  'CAPTAIN_OPEN_AI_ENDPOINT' => 'https://api.openai.com/v1',
  'CAPTAIN_CLOUD_PLAN_LIMITS' => { agents: 999999, inboxes: 999999 }.to_json
}

configs.each do |key, value|
  ic = InstallationConfig.find_by(name: key)
  if ic
    ic.value = value
    ic.save!
    puts "Updated: #{key}"
  end
end

# Enable Captain for account
a = Account.find(1)
a.enable_features!('captain_integration')

puts "\n✅ Captain AI enabled!"
puts "Test at: http://localhost:3015/app/accounts/1/captain/assistants"