import { ModelMetadata, LoadedModel } from '../../shared/types/ModelMetadata';
import { ResourceScheduler } from './ResourceScheduler';

/**
 * Model Manager for handling model loading and unloading with VRAM management
 */
export class ModelManager {
  private resourceScheduler: ResourceScheduler;
  private loadedModels: Map<string, LoadedModel> = new Map();
  private modelRegistry: Map<string, ModelMetadata> = new Map();

  constructor(resourceScheduler: ResourceScheduler) {
    this.resourceScheduler = resourceScheduler;
  }

  /**
   * Register a model with its metadata
   * @param modelId The unique identifier for the model
   * @param metadata The metadata for the model
   */
  registerModel(modelId: string, metadata: ModelMetadata): void {
    this.modelRegistry.set(modelId, metadata);
    console.log(`Registered model: ${modelId}`);
  }

  /**
   * Check if a model can be loaded given current VRAM constraints
   * @param modelId The identifier of the model to check
   * @returns True if the model can be loaded, false otherwise
   */
  canLoad(modelId: string): boolean {
    const metadata = this.modelRegistry.get(modelId);
    
    if (!metadata) {
      console.warn(`Model ${modelId} not registered`);
      return false;
    }
    
    return this.resourceScheduler.canLoad(metadata.vramRequired);
  }

  /**
   * Load a model into memory
   * @param modelId The identifier of the model to load
   * @returns Promise that resolves to true if successful, false otherwise
   */
  async loadModel(modelId: string): Promise<boolean> {
    const metadata = this.modelRegistry.get(modelId);
    
    if (!metadata) {
      console.warn(`Model ${modelId} not registered`);
      return false;
    }

    // Check if model is already loaded
    if (this.loadedModels.has(modelId) && 
        this.loadedModels.get(modelId)!.status === 'loaded') {
      console.log(`Model ${modelId} is already loaded`);
      return true;
    }

    // Check if we can load the model
    if (!this.canLoad(modelId)) {
      console.log(`Not enough VRAM to load model: ${modelId}`);
      
      // Try to make space by unloading models
      const unloaded = await this.makeSpaceForModel(metadata);
      if (!unloaded) {
        return false;
      }
    }

    // Reserve VRAM for the model
    if (!this.resourceScheduler.reserve(metadata.vramRequired)) {
      console.warn(`Failed to reserve VRAM for model: ${modelId}`);
      return false;
    }

    // Create loaded model instance
    const loadedModel: LoadedModel = {
      id: modelId,
      metadata: metadata,
      status: 'loaded',
      loadedAt: new Date()
    };

    this.loadedModels.set(modelId, loadedModel);
    console.log(`Model ${modelId} loaded successfully`);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, metadata.loadTime));
    
    return true;
  }

  /**
   * Unload a model from memory
   * @param modelId The identifier of the model to unload
   * @returns Promise that resolves to true if successful, false otherwise
   */
  async unloadModel(modelId: string): Promise<boolean> {
    const loadedModel = this.loadedModels.get(modelId);
    
    if (!loadedModel || loadedModel.status === 'unloaded') {
      console.log(`Model ${modelId} is not loaded`);
      return true;
    }

    // Release VRAM for the model
    this.resourceScheduler.release(loadedModel.metadata.vramRequired);

    // Update model status
    loadedModel.status = 'unloaded';
    loadedModel.loadedAt = undefined;
    
    this.loadedModels.set(modelId, loadedModel);
    console.log(`Model ${modelId} unloaded successfully`);
    
    return true;
  }

  /**
   * Get the metadata for a registered model
   * @param modelId The identifier of the model
   * @returns The model metadata or undefined if not found
   */
  getModelMetadata(modelId: string): ModelMetadata | undefined {
    return this.modelRegistry.get(modelId);
  }

  /**
   * Get all loaded models
   * @returns Array of loaded models
   */
  getLoadedModels(): LoadedModel[] {
    return Array.from(this.loadedModels.values()).filter(model => model.status === 'loaded');
  }

  /**
   * Check if a model is currently loaded
   * @param modelId The identifier of the model to check
   * @returns True if the model is loaded, false otherwise
   */
  isModelLoaded(modelId: string): boolean {
    const model = this.loadedModels.get(modelId);
    return model !== undefined && model.status === 'loaded';
  }

  /**
   * Get available VRAM capacity
   * @returns Available VRAM in bytes
   */
  getAvailableVram(): number {
    return this.resourceScheduler.getAvailableVram();
  }

  /**
   * Make space for a new model by unloading other models if needed
   * @param newModelMetadata The metadata of the new model that needs space
   * @returns True if space was made, false otherwise
   */
  private async makeSpaceForModel(newModelMetadata: ModelMetadata): Promise<boolean> {
    // Check if we can load this model with concurrent models
    if (newModelMetadata.canRunConcurrent) {
      console.log(`Model ${newModelMetadata} can run concurrently`);
      return true;
    }

    // If the new model cannot run concurrently, we need to unload other models
    // Find models that can be unloaded based on priority and current usage
    
    const loadedModels = this.getLoadedModels();
    
    // Sort by priority (lower numbers = higher priority)
    loadedModels.sort((a, b) => a.metadata.priority - b.metadata.priority);
    
    // Try to unload models until we have enough space
    let totalUnloadedVram = 0;
    
    for (const model of loadedModels) {
      // Skip if this is the same model we're trying to load
      if (model.id === newModelMetadata) {
        continue;
      }
      
      // Check if we can unload this model (it's not a required model or has lower priority)
      const canUnload = !model.metadata.canRunConcurrent || 
                       model.metadata.priority > newModelMetadata.priority;
      
      if (canUnload) {
        console.log(`Unloading model ${model.id} to make space for ${newModelMetadata}`);
        
        // Unload the model
        await this.unloadModel(model.id);
        totalUnloadedVram += model.metadata.vramRequired;
        
        // Check if we have enough VRAM now
        if (this.resourceScheduler.canLoad(newModelMetadata.vramRequired)) {
          console.log(`Enough VRAM available after unloading models`);
          return true;
        }
      }
    }
    
    // If we've unloaded all possible models and still can't fit, return false
    console.warn(`Not enough VRAM to load model after unloading other models`);
    return false;
  }
}