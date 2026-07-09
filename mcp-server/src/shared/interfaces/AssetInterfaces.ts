export interface AssetGenerationRequest {
  prompt: string;
  style?: string;
  resolution?: string;
  count?: number;
  iterations?: number;
}

export interface AssetGenerationResult {
  imageUrl: string;
  prompt: string;
  style?: string;
  resolution?: string;
  iterations?: number;
  modelUrl?: string;
  metadata?: Record<string, unknown>;
  status?: 'pending' | 'completed' | 'failed';
}
