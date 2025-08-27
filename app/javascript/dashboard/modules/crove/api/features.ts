import { API } from './client';

interface Feature {
  enabled: boolean;
  display_name: string;
  description: string;
}

interface FeaturesResponse {
  features: Record<string, Feature>;
}

interface FeatureActionResponse {
  success: boolean;
  message: string;
  enabled?: boolean;
  features?: string[];
}

class CroveFeaturesAPI {
  private accountId: number;

  constructor(accountId: number) {
    this.accountId = accountId;
  }

  async getFeatures(): Promise<FeaturesResponse> {
    const response = await API.get(`/api/v1/accounts/${this.accountId}/crove_features`);
    return response.data;
  }

  async enableFeature(featureName: string): Promise<FeatureActionResponse> {
    const response = await API.post(
      `/api/v1/accounts/${this.accountId}/crove_features/enable/${featureName}`
    );
    return response.data;
  }

  async disableFeature(featureName: string): Promise<FeatureActionResponse> {
    const response = await API.post(
      `/api/v1/accounts/${this.accountId}/crove_features/disable/${featureName}`
    );
    return response.data;
  }

  async enableAllFeatures(): Promise<FeatureActionResponse> {
    const response = await API.post(
      `/api/v1/accounts/${this.accountId}/crove_features/enable_all`
    );
    return response.data;
  }

  // Helper method to check if a specific feature is enabled
  async isFeatureEnabled(featureName: string): Promise<boolean> {
    try {
      const { features } = await this.getFeatures();
      return features[featureName]?.enabled || false;
    } catch (error) {
      console.error(`Failed to check feature status for ${featureName}:`, error);
      return false;
    }
  }

  // Batch check multiple features
  async checkFeatures(featureNames: string[]): Promise<Record<string, boolean>> {
    try {
      const { features } = await this.getFeatures();
      const result: Record<string, boolean> = {};
      
      featureNames.forEach(name => {
        result[name] = features[name]?.enabled || false;
      });
      
      return result;
    } catch (error) {
      console.error('Failed to check features:', error);
      // Return all as disabled on error
      return featureNames.reduce((acc, name) => {
        acc[name] = false;
        return acc;
      }, {} as Record<string, boolean>);
    }
  }
}

export default CroveFeaturesAPI;