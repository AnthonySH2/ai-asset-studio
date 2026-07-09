/**
 * Resource Scheduler for managing GPU VRAM allocation
 */
export class ResourceScheduler {
  private vramCapacity: number;
  private vramUsage: number = 0;
  private loadedModels: Set<string> = new Set();
  
  constructor(vramCapacity: number = 24 * 1024 * 1024 * 1024) { // Default 24GB VRAM
    this.vramCapacity = vramCapacity;
  }
  
  /**
   * Check if a model can be loaded given current VRAM constraints
   * @param modelSize The size of the model to be loaded (in bytes)
   * @returns True if the model can be loaded, false otherwise
   */
  canLoad(modelSize: number): boolean {
    return (this.vramUsage + modelSize) <= this.vramCapacity;
  }
  
  /**
   * Reserve VRAM for a model
   * @param modelSize The size of the model to reserve VRAM for (in bytes)
   * @returns True if VRAM was successfully reserved, false otherwise
   */
  reserve(modelSize: number): boolean {
    if (this.canLoad(modelSize)) {
      this.vramUsage += modelSize;
      return true;
    }
    return false;
  }
  
  /**
   * Release VRAM for a model
   * @param modelSize The size of the model to release VRAM for (in bytes)
   */
  release(modelSize: number): void {
    this.vramUsage = Math.max(0, this.vramUsage - modelSize);
  }
  
  /**
   * Get current VRAM usage
   * @returns Current VRAM usage in bytes
   */
  getVramUsage(): number {
    return this.vramUsage;
  }
  
  /**
   * Get available VRAM capacity
   * @returns Available VRAM capacity in bytes
   */
  getAvailableVram(): number {
    return this.vramCapacity - this.vramUsage;
  }
  
  /**
   * Get VRAM capacity
   * @returns Total VRAM capacity in bytes
   */
  getVramCapacity(): number {
    return this.vramCapacity;
  }
  
  /**
   * Check if a model is currently loaded
   * @param modelId The ID of the model to check
   * @returns True if the model is loaded, false otherwise
   */
  isModelLoaded(modelId: string): boolean {
    return this.loadedModels.has(modelId);
  }
  
  /**
   * Mark a model as loaded
   * @param modelId The ID of the model to mark as loaded
   */
  markModelLoaded(modelId: string): void {
    this.loadedModels.add(modelId);
  }
  
  /**
   * Mark a model as unloaded
   * @param modelId The ID of the model to mark as unloaded
   */
  markModelUnloaded(modelId: string): void {
    this.loadedModels.delete(modelId);
  }
}