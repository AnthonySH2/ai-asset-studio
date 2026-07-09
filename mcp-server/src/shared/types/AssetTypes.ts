export type AssetType = 'image' | 'model' | 'audio' | 'video';

export interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  description?: string;
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
