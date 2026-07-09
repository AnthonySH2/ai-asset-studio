import fs from 'fs';
import path from 'path';

/**
 * Asset Registry for managing assets
 */
export class AssetRegistry {
  private assetBasePath: string;
  
  constructor(assetBasePath: string = './assets') {
    this.assetBasePath = assetBasePath;
    
    // Ensure asset directories exist
    this.ensureAssetDirectories();
  }
  
  /**
   * Ensure that all required asset directories exist
   */
  private ensureAssetDirectories(): void {
    const directories = [
      'images',
      'glb',
      'thumbnails',
      'metadata'
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(this.assetBasePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }
  
  /**
   * Save an asset to the registry
   * @param assetId The ID of the asset
   * @param assetData The data to save
   * @param type The type of asset (image, glb, etc.)
   * @returns The path where the asset was saved
   */
  async saveAsset(assetId: string, assetData: Buffer | string, type: 'image' | 'glb' | 'thumbnail' | 'metadata'): Promise<string> {
    const assetDir = path.join(this.assetBasePath, type);
    const assetPath = path.join(assetDir, `${assetId}.${this.getAssetExtension(type)}`);
    
    // Write the asset data
    if (typeof assetData === 'string') {
      fs.writeFileSync(assetPath, assetData);
    } else {
      fs.writeFileSync(assetPath, assetData);
    }
    
    return assetPath;
  }
  
  /**
   * Get the file extension for an asset type
   * @param type The asset type
   * @returns The file extension
   */
  private getAssetExtension(type: 'image' | 'glb' | 'thumbnail' | 'metadata'): string {
    switch (type) {
      case 'image': return 'png';
      case 'glb': return 'glb';
      case 'thumbnail': return 'jpg';
      case 'metadata': return 'json';
      default: return 'dat';
    }
  }
  
  /**
   * Load an asset from the registry
   * @param assetId The ID of the asset
   * @param type The type of asset (image, glb, etc.)
   * @returns The asset data
   */
  async loadAsset(assetId: string, type: 'image' | 'glb' | 'thumbnail' | 'metadata'): Promise<Buffer | string> {
    const assetDir = path.join(this.assetBasePath, type);
    const assetPath = path.join(assetDir, `${assetId}.${this.getAssetExtension(type)}`);
    
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Asset not found: ${assetPath}`);
    }
    
    return fs.readFileSync(assetPath);
  }
  
  /**
   * Check if an asset exists
   * @param assetId The ID of the asset
   * @param type The type of asset (image, glb, etc.)
   * @returns True if the asset exists, false otherwise
   */
  async assetExists(assetId: string, type: 'image' | 'glb' | 'thumbnail' | 'metadata'): Promise<boolean> {
    const assetDir = path.join(this.assetBasePath, type);
    const assetPath = path.join(assetDir, `${assetId}.${this.getAssetExtension(type)}`);
    
    return fs.existsSync(assetPath);
  }
  
  /**
   * Get the base path of the asset registry
   * @returns The base path
   */
  getBasePath(): string {
    return this.assetBasePath;
  }
}