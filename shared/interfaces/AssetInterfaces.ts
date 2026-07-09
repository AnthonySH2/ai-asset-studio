/**
 * Interface for asset generation request
 */
export interface AssetGenerationRequest {
  prompt: string;
  iterations?: number;
  style?: string;
  resolution?: string;
}

/**
 * Interface for asset generation response
 */
export interface AssetGenerationResponse {
  imageUrl: string;
  modelUrl: string;
  metadata: AssetMetadata;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Interface for asset metadata
 */
export interface AssetMetadata {
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  iterations?: number;
  style?: string;
  resolution?: string;
  modelFormat?: string;
  fileSize?: number;
}

/**
 * Interface for job status
 */
export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  result?: AssetGenerationResponse;
}

/**
 * Interface for model management
 */
export interface ModelManager {
  loadModel(modelId: string): Promise<boolean>;
  unloadModel(modelId: string): Promise<boolean>;
  listModels(): Promise<string[]>;
  getModelInfo(modelId: string): Promise<ModelInfo | null>;
}

/**
 * Interface for model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  type: 'image' | '3d' | 'animation';
  status: 'loaded' | 'unloaded' | 'error';
  size?: number;
  description?: string;
}

/**
 * Interface for workflow orchestration
 */
export interface WorkflowOrchestrator {
  submitJob(request: AssetGenerationRequest): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<boolean>;
  pauseJob(jobId: string): Promise<boolean>;
  resumeJob(jobId: string): Promise<boolean>;
}