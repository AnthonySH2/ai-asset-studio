import os
import uuid
from datetime import datetime
from typing import Optional
from orchestrator.app.models.image_generation_request import ImageGenerationRequest
from orchestrator.app.models.image_generation_result import ImageGenerationResult
from orchestrator.app.models.workflow_status import WorkflowStatus
from orchestrator.app.services.i_image_provider import IImageProvider
from orchestrator.app.services.image_storage_service import ImageStorageService

class ImageWorkflow:
    """Clase principal para el flujo de generación de imágenes."""
    
    def __init__(self, 
                 provider: IImageProvider, 
                 storage_service: ImageStorageService,
                 workflow_id: Optional[str] = None):
        self.workflow_id = workflow_id or str(uuid.uuid4())
        self.provider = provider
        self.storage_service = storage_service
        self.status = WorkflowStatus.CREATED
        self.request: Optional[ImageGenerationRequest] = None
        self.result: Optional[ImageGenerationResult] = None
        
    def execute(self, request: ImageGenerationRequest) -> ImageGenerationResult:
        """Ejecuta el flujo completo de generación de imagen."""
        try:
            # Establecer la solicitud
            self.request = request
            
            # Actualizar estado
            self.status = WorkflowStatus.GENERATING_IMAGE
            print(f"Workflow {self.workflow_id}: Generando imagen...")
            
            # Cargar proveedor si es necesario
            self.provider.load()
            
            # Generar imagen mock
            self.result = self.provider.generate_image(request)
            
            # Actualizar estado
            if self.result.status == WorkflowStatus.IMAGE_GENERATED.value:
                self.status = WorkflowStatus.PERSISTING
                print(f"Workflow {self.workflow_id}: Persistiendo artefactos...")
                
                # Guardar imagen y metadata
                self.storage_service.save_workflow_artifacts(self.result)
                
                # Actualizar estado final
                self.status = WorkflowStatus.IMAGE_GENERATED
                print(f"Workflow {self.workflow_id}: Imagen generada y almacenada exitosamente")
            else:
                self.status = WorkflowStatus.FAILED
                print(f"Workflow {self.workflow_id}: Error en la generación de imagen")
            
            return self.result
            
        except Exception as e:
            # En caso de error, actualizar estado y registrar el error
            self.status = WorkflowStatus.FAILED
            print(f"Workflow {self.workflow_id}: Error en ejecución: {e}")
            
            # Si ya tenemos un resultado parcial, lo devolvemos con error
            if self.result:
                self.result.error = str(e)
                return self.result
            
            # Si no, creamos un nuevo resultado de error
            error_result = ImageGenerationResult(
                workflow_id=self.workflow_id,
                prompt=request.prompt,
                provider="MockImageProvider",
                status=WorkflowStatus.FAILED.value,
                image_path="",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                version="1.0.0",
                error=str(e)
            )
            return error_result
        finally:
            # Descargar proveedor si es necesario
            self.provider.unload()
    
    def get_workflow_artifacts(self) -> Optional[dict]:
        """Obtiene los artefactos del workflow."""
        if self.workflow_id:
            return self.storage_service.load_workflow_artifacts(self.workflow_id)
        return None
    
    def get_status(self) -> str:
        """Obtiene el estado actual del workflow."""
        return self.status.value