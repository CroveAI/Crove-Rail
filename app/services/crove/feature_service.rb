module Crove
  class FeatureService
    class << self
      # Check if a feature is enabled for an account
      def enabled?(account, feature_name)
        return false unless account
        
        feature_name = normalize_feature_name(feature_name)
        account.feature_enabled?(feature_name)
      end

      # Enable features for an account
      def enable!(account, *feature_names)
        return false unless account
        
        normalized_names = feature_names.map { |name| normalize_feature_name(name) }
        account.enable_features!(*normalized_names)
      end

      # Disable features for an account
      def disable!(account, *feature_names)
        return false unless account
        
        normalized_names = feature_names.map { |name| normalize_feature_name(name) }
        account.disable_features!(*normalized_names)
      end

      # Get all enabled features for an account
      def enabled_features(account)
        return {} unless account
        
        account.enabled_features
      end

      # Get all available Crove features
      def crove_features
        Featurable::FEATURE_LIST.select do |feature|
          feature['name'].start_with?('crove_')
        end
      end

      # Get premium Crove features
      def premium_features
        crove_features.select { |f| f['premium'] == true }
      end

      # Bulk update features for an account
      def update_features!(account, features_map)
        return false unless account
        
        features_to_enable = []
        features_to_disable = []

        features_map.each do |feature_name, enabled|
          normalized_name = normalize_feature_name(feature_name)
          if enabled
            features_to_enable << normalized_name
          else
            features_to_disable << normalized_name
          end
        end

        account.enable_features(*features_to_enable) if features_to_enable.any?
        account.disable_features(*features_to_disable) if features_to_disable.any?
        account.save
      end

      # Check if account has access to premium features
      def has_premium_access?(account)
        return false unless account
        
        # Check if any premium Crove feature is enabled
        premium_features.any? do |feature|
          account.feature_enabled?(feature['name'])
        end
      end

      # Enable all Crove features (for development/testing)
      def enable_all_crove_features!(account)
        return false unless account
        
        feature_names = crove_features.map { |f| f['name'] }
        account.enable_features!(*feature_names)
      end

      # Disable all Crove features
      def disable_all_crove_features!(account)
        return false unless account
        
        feature_names = crove_features.map { |f| f['name'] }
        account.disable_features!(*feature_names)
      end

      private

      def normalize_feature_name(name)
        name = name.to_s
        # Remove 'feature_' prefix if present
        name = name.gsub(/^feature_/, '')
        # Ensure it's a valid feature name
        unless valid_feature?(name)
          Rails.logger.warn "Invalid feature name: #{name}"
        end
        name
      end

      def valid_feature?(name)
        Featurable::FEATURE_LIST.any? { |f| f['name'] == name }
      end
    end
  end
end