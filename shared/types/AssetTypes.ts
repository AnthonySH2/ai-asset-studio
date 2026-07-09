/**
 * Type for asset generation status
 */
export type AssetGenerationStatus = 'pending' | 'completed' | 'failed';

/**
 * Type for asset format
 */
export type AssetFormat = 'png' | 'jpg' | 'glb' | 'obj' | 'fbx' | 'usdz';

/**
 * Type for asset type
 */
export type AssetType = 'image' | '3d-model' | 'animation';

/**
 * Type for job status
 */
export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Type for model type
 */
export type ModelType = 'image' | '3d' | 'animation';

/**
 * Type for model status
 */
export type ModelStatus = 'loaded' | 'unloaded' | 'error';

/**
 * Type for workflow step
 */
export type WorkflowStep = 
  | 'prompt_received'
  | 'image_generation'
  | 'image_approval'
  | '3d_model_generation'
  | 'model_optimization'
  | 'asset_delivery';

/**
 * Type for asset generation result
 */
export interface AssetGenerationResult {
  imageUrl: string;
  modelUrl: string;
  metadata: {
    prompt: string;
    createdAt: Date;
    updatedAt: Date;
    iterations?: number;
    style?: string;
    resolution?: string;
    modelFormat?: AssetFormat;
    fileSize?: number;
    workflowSteps: WorkflowStep[];
  };
  status: AssetGenerationStatus;
}