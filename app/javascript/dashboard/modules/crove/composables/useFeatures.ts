import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import CroveFeaturesAPI from '../api/features';
import { FEATURE_FLAGS } from '../../../featureFlags';

// Crove feature flags mapping
const CROVE_FEATURES = {
  ASSISTANTS: FEATURE_FLAGS.CROVE_ASSISTANTS,
  KNOWLEDGE_BASE: FEATURE_FLAGS.CROVE_KNOWLEDGE_BASE,
  ADVANCED_SLA: FEATURE_FLAGS.CROVE_ADVANCED_SLA,
  AUDIT_LOGS: FEATURE_FLAGS.CROVE_AUDIT_LOGS,
  CUSTOM_ROLES: FEATURE_FLAGS.CROVE_CUSTOM_ROLES,
  WHITE_LABEL: FEATURE_FLAGS.CROVE_WHITE_LABEL,
  HELP_CENTER: FEATURE_FLAGS.CROVE_HELP_CENTER,
} as const;

export function useCroveFeatures() {
  const store = useStore();
  const featuresLoading = ref(false);
  const featuresError = ref<string | null>(null);
  const features = ref<Record<string, boolean>>({});

  // Get current account ID from store
  const accountId = computed(() => {
    return store.getters['getCurrentAccountId'];
  });

  // Get account features from store
  const accountFeatures = computed(() => {
    return store.getters['accounts/getAccount'](accountId.value)?.features || {};
  });

  // Check if a specific Crove feature is enabled
  const isFeatureEnabled = (featureName: keyof typeof CROVE_FEATURES): boolean => {
    const featureKey = CROVE_FEATURES[featureName];
    return accountFeatures.value[featureKey] === true;
  };

  // Check if any Crove premium feature is enabled
  const hasPremiumAccess = computed(() => {
    return Object.values(CROVE_FEATURES).some(
      featureKey => accountFeatures.value[featureKey] === true
    );
  });

  // Load features from API
  const loadFeatures = async () => {
    if (!accountId.value) return;

    featuresLoading.value = true;
    featuresError.value = null;

    try {
      const api = new CroveFeaturesAPI(accountId.value);
      const response = await api.getFeatures();
      
      // Update local features state
      Object.entries(response.features).forEach(([key, feature]) => {
        features.value[key] = feature.enabled;
      });
    } catch (error) {
      featuresError.value = error?.message || 'Failed to load features';
      console.error('Failed to load Crove features:', error);
    } finally {
      featuresLoading.value = false;
    }
  };

  // Enable a feature
  const enableFeature = async (featureName: string) => {
    if (!accountId.value) return false;

    try {
      const api = new CroveFeaturesAPI(accountId.value);
      const response = await api.enableFeature(featureName);
      
      if (response.success) {
        features.value[featureName] = true;
        // Optionally refresh account data in store
        await store.dispatch('accounts/get');
      }
      
      return response.success;
    } catch (error) {
      console.error(`Failed to enable feature ${featureName}:`, error);
      return false;
    }
  };

  // Disable a feature
  const disableFeature = async (featureName: string) => {
    if (!accountId.value) return false;

    try {
      const api = new CroveFeaturesAPI(accountId.value);
      const response = await api.disableFeature(featureName);
      
      if (response.success) {
        features.value[featureName] = false;
        // Optionally refresh account data in store
        await store.dispatch('accounts/get');
      }
      
      return response.success;
    } catch (error) {
      console.error(`Failed to disable feature ${featureName}:`, error);
      return false;
    }
  };

  // Enable all premium features
  const enableAllFeatures = async () => {
    if (!accountId.value) return false;

    try {
      const api = new CroveFeaturesAPI(accountId.value);
      const response = await api.enableAllFeatures();
      
      if (response.success) {
        // Update all features to enabled
        Object.keys(CROVE_FEATURES).forEach(key => {
          const featureKey = CROVE_FEATURES[key as keyof typeof CROVE_FEATURES];
          features.value[featureKey] = true;
        });
        // Refresh account data in store
        await store.dispatch('accounts/get');
      }
      
      return response.success;
    } catch (error) {
      console.error('Failed to enable all features:', error);
      return false;
    }
  };

  // Load features on mount
  onMounted(() => {
    loadFeatures();
  });

  return {
    // State
    features,
    featuresLoading,
    featuresError,
    
    // Computed
    hasPremiumAccess,
    
    // Methods
    isFeatureEnabled,
    loadFeatures,
    enableFeature,
    disableFeature,
    enableAllFeatures,
    
    // Constants
    CROVE_FEATURES,
  };
}

// Export feature names for easy access
export { CROVE_FEATURES };