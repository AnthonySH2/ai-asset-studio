import { ModelManager } from './ModelManager';
import { ResourceScheduler } from './ResourceScheduler';
import { ModelMetadata } from '../../shared/types/ModelMetadata';

// Mock ResourceScheduler for testing
class MockResourceScheduler {
  private availableVram: number;
  
  constructor(initialVram: number) {
    this.availableVram = initialVram;
  }
  
  canLoad(vramRequired: number): boolean {
    return this.availableVram >= vramRequired;
  }
  
  reserve(vramRequired: number): boolean {
    if (this.availableVram >= vramRequired) {
      this.availableVram -= vramRequired;
      return true;
    }
    return false;
  }
  
  release(vramRequired: number): void {
    this.availableVram += vramRequired;
  }
  
  getAvailableVram(): number {
    return this.availableVram;
  }
}

describe('ModelManager', () => {
  let resourceScheduler: MockResourceScheduler;
  let modelManager: ModelManager;
  
  beforeEach(() => {
    // Initialize with 24GB VRAM (as required for RTX 4090)
    resourceScheduler = new MockResourceScheduler(24 * 1024 * 1024 * 1024);
    modelManager = new ModelManager(resourceScheduler as unknown as ResourceScheduler);
  });
  
  test('should register a model correctly', () => {
    const modelMetadata: ModelMetadata = {
      vramRequired: 8 * 1024 * 1024 * 1024, // 8GB
      loadTime: 1000,
      priority: 1,
      canRunConcurrent: true
    };
    
    modelManager.registerModel('test-model', modelMetadata);
    
    const metadata = modelManager.getModelMetadata('test-model');
    expect(metadata).toBeDefined();
    if (metadata) {
      expect(metadata.vramRequired).toBe(8 * 1024 * 1024 * 1024);
      expect(metadata.loadTime).toBe(1000);
      expect(metadata.priority).toBe(1);
      expect(metadata.canRunConcurrent).toBe(true);
    }
  });
  
  test('should check if model can be loaded', () => {
    const modelMetadata: ModelMetadata = {
      vramRequired: 8 * 1024 * 1024 * 1024, // 8GB
      loadTime: 1000,
      priority: 1,
      canRunConcurrent: true
    };
    
    modelManager.registerModel('test-model', modelMetadata);
    
    const canLoad = modelManager.canLoad('test-model');
    expect(canLoad).toBe(true);
  });
  
  test('should return available VRAM correctly', () => {
    const availableVram = modelManager.getAvailableVram();
    expect(availableVram).toBe(24 * 1024 * 1024 * 1024);
  });
  
  test('should handle loading and unloading models', async () => {
    const modelMetadata: ModelMetadata = {
      vramRequired: 8 * 1024 * 1024 * 1024, // 8GB
      loadTime: 100,
      priority: 1,
      canRunConcurrent: true
    };
    
    modelManager.registerModel('test-model', modelMetadata);
    
    // Test loading
    const loaded = await modelManager.loadModel('test-model');
    expect(loaded).toBe(true);
    
    // Test if model is loaded
    const isLoaded = modelManager.isModelLoaded('test-model');
    expect(isLoaded).toBe(true);
    
    // Test unloading
    const unloaded = await modelManager.unloadModel('test-model');
    expect(unloaded).toBe(true);
    
    // Test if model is now unloaded
    const isNowLoaded = modelManager.isModelLoaded('test-model');
    expect(isNowLoaded).toBe(false);
  });
  
  test('should handle multiple models correctly', async () => {
    const model1Metadata: ModelMetadata = {
      vramRequired: 8 * 1024 * 1024 * 1024, // 8GB
      loadTime: 100,
      priority: 1,
      canRunConcurrent: true
    };
    
    const model2Metadata: ModelMetadata = {
      vramRequired: 4 * 1024 * 1024 * 1024, // 4GB
      loadTime: 50,
      priority: 2,
      canRunConcurrent: true
    };
    
    modelManager.registerModel('model-1', model1Metadata);
    modelManager.registerModel('model-2', model2Metadata);
    
    // Load both models (should work since they can run concurrently)
    const loaded1 = await modelManager.loadModel('model-1');
    const loaded2 = await modelManager.loadModel('model-2');
    
    expect(loaded1).toBe(true);
    expect(loaded2).toBe(true);
    
    // Check that both are loaded
    expect(modelManager.isModelLoaded('model-1')).toBe(true);
    expect(modelManager.isModelLoaded('model-2')).toBe(true);
  });
});