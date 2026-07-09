from abc import ABC, abstractmethod
from typing import Dict, Any
from orchestrator.app.models.image_generation_request import ImageGenerationRequest
from orchestrator.app.models.image_generation_result import ImageGenerationResult

class IImageProvider(ABC):
    """Interfaz abstracta para proveedores de imágenes."""
    
    @abstractmethod
    def load(self) -> None:
        """Carga el proveedor si es necesario."""
        pass
    
    @abstractmethod
    def unload(self) -> None:
        """Descarga el proveedor si es necesario."""
        pass
    
    @abstractmethod
    def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResult:
        """Genera una imagen a partir de una solicitud."""
        pass