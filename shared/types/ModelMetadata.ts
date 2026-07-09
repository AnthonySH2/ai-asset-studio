/**
 * Interface for model metadata that each model must declare
 */
export interface ModelMetadata {
  /**
   * VRAM required by the model (in bytes)
   */
  vramRequired: number;
  
  /**
   * Time to load the model (in milliseconds)
   */
  loadTime: number;
  
  /**
   * Priority of the model for loading/unloading decisions
   */
  priority: number;
  
  /**
   * Whether this model can run concurrently with other models
   */
  canRunConcurrent: boolean;
}

/**
 * Interface for a loaded model instance
 */
export interface LoadedModel {
  /**
   * Unique identifier for the model
   */
  id: string;
  
  /**
   * Model metadata
   */
  metadata: ModelMetadata;
  
  /**
   * Status of the model (loaded/unloaded)
   */
  status: 'loaded' | 'unloaded';
  
  /**
   * Timestamp when the model was loaded
   */
  loadedAt?: Date;
}
