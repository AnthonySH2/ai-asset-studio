/**
 * Interface for AI Providers
 */
export interface AssetGenerationRequest {
  prompt: string;
  iterations?: number;
  style?: string;
  resolution?: string;
  // Add other request parameters as needed
}

export interface AssetMetadata {
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  iterations: number;
  style: string;
  resolution: string;
  modelFormat: string;
  fileSize: number;
  workflowSteps: string[];
}

export interface AssetGenerationResult {
  imageUrl?: string;
  modelUrl?: string;
  metadata: AssetMetadata;
  status: 'completed' | 'failed';
}

export interface IAIProvider {
  /**
   * Generate an asset based on the provided request
   * @param request The asset generation request
   * @returns Promise that resolves to the generated asset result
   */
  generateAsset(request: AssetGenerationRequest): Promise<AssetGenerationResult>;
  
  /**
   * Check if the provider is ready to generate assets
   * @returns True if the provider is ready, false otherwise
   */
  isReady(): boolean;
  
  /**
   * Get the provider type
   * @returns The type of the provider
   */
  getType(): string;
  
  /**
   * Load the model
   * @returns Promise that resolves to true if successful, false otherwise
   */
  load(): Promise<boolean>;
  
  /**
   * Unload the model
   * @returns Promise that resolves to true if successful, false otherwise
   */
  unload(): Promise<boolean>;
}