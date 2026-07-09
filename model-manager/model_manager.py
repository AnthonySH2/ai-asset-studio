"""
AI Asset Studio Model Manager
Manages loading and unloading of AI models for asset generation
"""

import logging
import asyncio
from typing import List, Optional, Dict
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
    def __init__(self, vram_capacity: int = 2048*1024*1024):  # 2GB default VRAM capacity
        self.vram_capacity = vram_capacity
        self.loaded_models: Dict[str, ModelInfo] = {}
        self.available_models: Dict[str, ModelInfo] = {
            "image-generator": ModelInfo(
                id="image-generator",
                name="Generador de Imágenes",
                version="1.0.0",
                type="image",
                status="unloaded",
                size=1024*1024*500,  # 500MB
                description="Genera imágenes a partir de prompts de texto"
            ),
            "3d-generator": ModelInfo(
                id="3d-generator",
                name="Generador 3D",
                version="1.0.0",
                type="3d",
                status="unloaded",
                size=1024*1024*1000,  # 1GB
                description="Genera modelos 3D a partir de imágenes"
            ),
            "model-optimizer": ModelInfo(
                id="model-optimizer",
                name="Optimizador de Modelos",
                version="1.0.0",
                type="3d",
                status="unloaded",
                size=1024*1024*200,  # 200MB
                description="Optimiza modelos 3D para rendimiento"
            )
        }
        self.model_types = {
            "image": ["image-generator"],
            "3d": ["3d-generator", "model-optimizer"]
        }
    
    def get_vram_usage(self) -> int:
        """Calculate current VRAM usage"""
        return sum(model.size for model in self.loaded_models.values() if model.size)
    
    def can_load_model(self, model_id: str) -> bool:
        """Check if a model can be loaded given current VRAM constraints"""
        if model_id not in self.available_models:
            return False
        
        model = self.available_models[model_id]
        if model.size is None:
            return True  # If no size specified, assume it can be loaded
        
        current_vram = self.get_vram_usage()
        return (current_vram + model.size) <= self.vram_capacity
    
    async def load_model(self, model_id: str) -> bool:
        """Load a model into memory"""
        if model_id not in self.available_models:
            logger.error(f"Modelo {model_id} no encontrado")
            return False
        
        # Check if we have enough VRAM
        if not self.can_load_model(model_id):
            logger.warning(f"No hay suficiente VRAM para cargar el modelo {model_id}")
            return False
        
        # Simulate loading time
        await asyncio.sleep(0.5)
        
        self.available_models[model_id].status = "loaded"
        self.loaded_models[model_id] = self.available_models[model_id]
        logger.info(f"Cargado modelo: {model_id}")
        return True
    
    async def unload_model(self, model_id: str) -> bool:
        """Unload a model from memory"""
        if model_id not in self.available_models:
            logger.error(f"Modelo {model_id} no encontrado")
            return False
        
        # Simulate unloading time
        await asyncio.sleep(0.2)
        
        self.available_models[model_id].status = "unloaded"
        if model_id in self.loaded_models:
            del self.loaded_models[model_id]
        logger.info(f"Descargado modelo: {model_id}")
        return True
    
    async def unload_all_models(self) -> None:
        """Unload all loaded models"""
        for model_id in list(self.loaded_models.keys()):
            await self.unload_model(model_id)
    
    async def load_models_by_type(self, model_type: str) -> List[str]:
        """Load all models of a specific type"""
        loaded_models = []
        
        if model_type not in self.model_types:
            return loaded_models
        
        # Try to load each model of this type
        for model_id in self.model_types[model_type]:
            success = await self.load_model(model_id)
            if success:
                loaded_models.append(model_id)
        
        return loaded_models
    
    async def unload_models_by_type(self, model_type: str) -> List[str]:
        """Unload all models of a specific type"""
        unloaded_models = []
        
        if model_type not in self.model_types:
            return unloaded_models
        
        # Try to unload each model of this type
        for model_id in self.model_types[model_type]:
            success = await self.unload_model(model_id)
            if success:
                unloaded_models.append(model_id)
        
        return unloaded_models
    
    async def list_models(self) -> List[ModelInfo]:
        """List all available models"""
        return list(self.available_models.values())
    
    async def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        """Get information about a specific model"""
        return self.available_models.get(model_id)
    
    def get_available_vram(self) -> int:
        """Get available VRAM capacity"""
        return self.vram_capacity - self.get_vram_usage()

# Create global model manager instance
model_manager = ModelManager()

@app.get("/")
async def root():
    return {"message": "AI Asset Studio Model Manager está ejecutándose"}

@app.post("/models/load/{model_id}")
async def load_model(model_id: str):
    """Cargar un modelo en memoria"""
    success = await model_manager.load_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    
    return {"message": f"Modelo {model_id} cargado exitosamente"}

@app.post("/models/unload/{model_id}")
async def unload_model(model_id: str):
    """Descargar un modelo de memoria"""
    success = await model_manager.unload_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    
    return {"message": f"Modelo {model_id} descargado exitosamente"}

@app.post("/models/load-type/{model_type}")
async def load_models_by_type(model_type: str):
    """Cargar todos los modelos de un tipo específico"""
    loaded = await model_manager.load_models_by_type(model_type)
    return {"message": f"Cargados {len(loaded)} modelos del tipo {model_type}", "models": loaded}

@app.post("/models/unload-type/{model_type}")
async def unload_models_by_type(model_type: str):
    """Descargar todos los modelos de un tipo específico"""
    unloaded = await model_manager.unload_models_by_type(model_type)
    return {"message": f"Descargados {len(unloaded)} modelos del tipo {model_type}", "models": unloaded}

@app.get("/models")
async def list_models():
    """Listar todos los modelos disponibles"""
    models = await model_manager.list_models()
    return {"models": models}

@app.get("/models/{model_id}")
async def get_model_info(model_id: str):
    """Obtener información sobre un modelo específico"""
    model = await model_manager.get_model_info(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    
    return {"model": model}

@app.get("/status")
async def get_status():
    """Obtener el estado actual del gestor de modelos"""
    return {
        "vram_capacity": model_manager.vram_capacity,
        "vram_usage": model_manager.get_vram_usage(),
        "available_vram": model_manager.get_available_vram(),
        "loaded_models": list(model_manager.loaded_models.keys()),
        "total_models": len(model_manager.available_models)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)