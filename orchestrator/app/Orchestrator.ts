import { ResourceScheduler } from './services/ResourceScheduler';
import { IAIProvider } from '../shared/interfaces/IAIProvider';
import { WorkflowStateMachine, WorkflowState } from './workflow/WorkflowStateMachine';
import { WorkflowPersistence } from './WorkflowPersistence';
import { AssetRegistry } from './AssetRegistry';
import { ModelManager } from './services/ModelManager';
import { ModelMetadata } from '../shared/types/ModelMetadata';

/**
 * Main Orchestrator class that coordinates the workflow
 */
export class Orchestrator {
  private resourceScheduler: ResourceScheduler;
  private providers: Map<string, IAIProvider>;
  private workflowPersistence: WorkflowPersistence;
  private assetRegistry: AssetRegistry;
  private modelManager: ModelManager;
  
  constructor() {
    // Initialize with 24GB VRAM capacity for RTX 4090 (as per task requirement)
    this.resourceScheduler = new ResourceScheduler(24 * 1024 * 1024 * 1024); // 24GB in bytes
    this.providers = new Map<string, IAIProvider>();
    this.workflowPersistence = new WorkflowPersistence();
    this.assetRegistry = new AssetRegistry();
    this.modelManager = new ModelManager(this.resourceScheduler);
  }
  
  /**
   * Register a provider with the orchestrator
   * @param provider The AI provider to register
   */
  registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.getType(), provider);
    console.log(`Registered provider: ${provider.getType()}`);
  }
  
  /**
   * Get a provider by type
   * @param type The type of provider to get
   * @returns The provider if found, undefined otherwise
   */
  getProvider(type: string): IAIProvider | undefined {
    return this.providers.get(type);
  }
  
  /**
   * Get all registered providers
   * @returns An array of all registered providers
   */
  getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * Start a new workflow
   * @param workflowId The ID of the workflow
   * @returns The workflow state machine for this workflow
   */
  startWorkflow(workflowId: string): WorkflowStateMachine {
    const workflow = new WorkflowStateMachine(workflowId);
    
    // Save initial workflow state
    this.workflowPersistence.saveWorkflowState(workflowId, {
      workflowId,
      currentState: WorkflowState.CREATED,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Started new workflow: ${workflowId}`);
    return workflow;
  }
  
  /**
   * Execute a workflow step using a provider
   * @param workflow The workflow state machine
   * @param providerType The type of provider to use
   * @param request The asset generation request
   * @returns Promise that resolves to the result of the execution
   */
  async executeWorkflowStep(workflow: WorkflowStateMachine, providerType: string, request: any): Promise<any> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      throw new Error(`No provider found for type: ${providerType}`);
    }
    
    // Check if the provider can be loaded given current VRAM usage
    const metadata = this.modelManager.getModelMetadata(providerType);
    if (!metadata) {
      throw new Error(`Model metadata not found for provider: ${providerType}`);
    }
    
    if (!this.resourceScheduler.canLoad(metadata.vramRequired)) {
      throw new Error(`Not enough VRAM to load provider: ${providerType}`);
    }
    
    // Reserve VRAM for this provider
    this.resourceScheduler.reserve(metadata.vramRequired);
    
    try {
      // Load the provider
      const loaded = await provider.load();
      
      if (!loaded) {
        throw new Error(`Failed to load provider: ${providerType}`);
      }
      
      console.log(`Executing workflow step using ${providerType} provider`);
      
      // Generate asset with the provider
      const result = await provider.generateAsset(request);
      
      return result;
    } finally {
      // Release VRAM after execution
      this.resourceScheduler.release(metadata.vramRequired);
      
      // Unload the provider
      await provider.unload();
    }
  }
  
  /**
   * Save workflow artifacts to registry
   * @param workflowId The ID of the workflow
   * @param fileName The name of the file to save
   * @param fileData The data to save
   */
  async saveArtifact(workflowId: string, fileName: string, fileData: Buffer | string): Promise<void> {
    await this.workflowPersistence.saveArtifact(workflowId, fileName, fileData);
  }
  
  /**
   * Get the resource scheduler
   * @returns The resource scheduler instance
   */
  getResourceScheduler(): ResourceScheduler {
    return this.resourceScheduler;
  }
  
  /**
   * Get the workflow persistence manager
   * @returns The workflow persistence instance
   */
  getWorkflowPersistence(): WorkflowPersistence {
    return this.workflowPersistence;
  }
  
  /**
   * Get the asset registry
   * @returns The asset registry instance
   */
  getAssetRegistry(): AssetRegistry {
    return this.assetRegistry;
  }
  
  /**
   * Get the model manager
   * @returns The model manager instance
   */
  getModelManager(): ModelManager {
    return this.modelManager;
  }
}