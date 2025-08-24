# frozen_string_literal: true

namespace :crove do
  namespace :plan do
    desc 'Apply a plan to an account. Usage: rake crove:plan:apply ACCOUNT_ID=1 PLAN=pro'
    task apply: :environment do
      account_id = ENV['ACCOUNT_ID']
      plan_key   = ENV['PLAN']

      unless account_id.present? && plan_key.present?
        puts 'Usage: rake crove:plan:apply ACCOUNT_ID=<id> PLAN=<free|pro|business|enterprise>'
        exit 1
      end

      account = Account.find(account_id)
      service = AccountPlanService.new(account: account)
      service.apply!(plan: plan_key)

      puts "Applied plan '#{plan_key}' to Account##{account.id}"
      puts "Enabled features: #{account.enabled_features.keys.sort.join(', ')}"
    rescue AccountPlanService::UnknownPlanError => e
      puts "Error: #{e.message}"
      exit 1
    end
  end
end


