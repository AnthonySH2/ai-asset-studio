"""
AI Asset Studio Model Manager
Manages loading and unloading of AI models for asset generation
"""

import logging
import asyncio
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="AI Asset Studio Model Manager", version="1.0.0")

class ModelInfo(BaseModel):
    id: str
    name: str
    version: str
    type: str  # 'image', '3d', 'animation'
    status: str  # 'loaded', 'unloaded', 'error'
    size: Optional[int] = None
    description: Optional[str] = None

class ModelManager:
    def __init__(self):
        self.loaded_models = {}
        self.available_models = {
            "image-generator": ModelInfo(
                id="image-generator",
                name="Image Generator",
                version="1.0.0",
                type="image",
                status="unloaded",
                size=1024*1024*500,  # 500MB
                description="Generates images from text prompts"
            ),
            "3d-generator": ModelInfo(
                id="3d-generator",
                name="3D Generator",
                version="1.0.0",
                type="3d",
                status="unloaded",
                size=1024*1024*1000,  # 1GB
                description="Generates 3D models from images"
            ),
            "model-optimizer": ModelInfo(
                id="model-optimizer",
                name="Model Optimizer",
                version="1.0.0",
                type="3d",
                status="unloaded",
                size=1024*1024*200,  # 200MB
                description="Optimizes 3D models for performance"
            )
        }
    
    async def load_model(self, model_id: str) -> bool:
        """Load a model into memory"""
        if model_id not in self.available_models:
            logger.error(f"Model {model_id} not found")
            return False
        
        # Simulate loading time
        await asyncio.sleep(0.5)
        
        self.available_models[model_id].status = "loaded"
        self.loaded_models[model_id] = self.available_models[model_id]
        logger.info(f"Loaded model: {model_id}")
        return True
    
    async def unload_model(self, model_id: str) -> bool:
        """Unload a model from memory"""
        if model_id not in self.available_models:
            logger.error(f"Model {model_id} not found")
            return False
        
        # Simulate unloading time
        await asyncio.sleep(0.2)
        
        self.available_models[model_id].status = "unloaded"
        if model_id in self.loaded_models:
            del self.loaded_models[model_id]
        logger.info(f"Unloaded model: {model_id}")
        return True
    
    async def list_models(self) -> List[ModelInfo]:
        """List all available models"""
        return list(self.available_models.values())
    
    async def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        """Get information about a specific model"""
        return self.available_models.get(model_id)

# Create global model manager instance
model_manager = ModelManager()

@app.get("/")
async def root():
    return {"message": "AI Asset Studio Model Manager is running"}

@app.post("/models/load/{model_id}")
async def load_model(model_id: str):
    """Load a model into memory"""
    success = await model_manager.load_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {"message": f"Model {model_id} loaded successfully"}

@app.post("/models/unload/{model_id}")
async def unload_model(model_id: str):
    """Unload a model from memory"""
    success = await model_manager.unload_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {"message": f"Model {model_id} unloaded successfully"}

@app.get("/models")
async def list_models():
    """List all available models"""
    models = await model_manager.list_models()
    return {"models": models}

@app.get("/models/{model_id}")
async def get_model_info(model_id: str):
    """Get information about a specific model"""
    model = await model_manager.get_model_info(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {"model": model}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)