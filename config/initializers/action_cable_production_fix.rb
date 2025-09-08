# Fix ActionCable configuration for production
if Rails.env.production?
  Rails.application.configure do
    # Mount ActionCable at /cable
    config.action_cable.mount_path = '/cable'
    
    # Set WebSocket URL for production
    config.action_cable.url = ENV.fetch('ACTION_CABLE_URL', 'wss://beta.crove.com/cable')
    
    # Allow requests from beta.crove.com
    config.action_cable.allowed_request_origins = [
      'https://beta.crove.com',
      'http://beta.crove.com',
      /https:\/\/beta\.crove\.com/,
      /http:\/\/localhost:\d+/
    ]
    
    # Disable request forgery protection for ActionCable
    config.action_cable.disable_request_forgery_protection = true
    
    Rails.logger.info "ActionCable configured for production:"
    Rails.logger.info "  Mount path: #{config.action_cable.mount_path}"
    Rails.logger.info "  URL: #{config.action_cable.url}"
    Rails.logger.info "  Allowed origins: #{config.action_cable.allowed_request_origins}"
  end
end