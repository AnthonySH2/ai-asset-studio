import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from orchestrator.app.models.image_generation_result import ImageGenerationResult

class ImageStorageService:
    """Servicio para almacenar imágenes y metadatos."""
    
    def __init__(self, base_output_dir: str = "workflows"):
        self.base_output_dir = base_output_dir
    
    def save_workflow_artifacts(self, result: ImageGenerationResult) -> None:
        """Guarda la imagen y los metadatos del workflow."""
        try:
            # Crear directorio si no existe
            workflow_dir = os.path.join(self.base_output_dir, result.workflow_id)
            os.makedirs(workflow_dir, exist_ok=True)
            
            # Guardar metadata
            self._save_metadata(workflow_dir, result)
            
            # Si la imagen fue generada exitosamente, copiarla al directorio del workflow
            if result.status == "IMAGE_GENERATED" and result.image_path:
                self._copy_image_to_workflow_dir(workflow_dir, result.image_path)
                
        except Exception as e:
            print(f"Error guardando artefactos del workflow: {e}")
            raise
    
    def _save_metadata(self, workflow_dir: str, result: ImageGenerationResult) -> None:
        """Guarda los metadatos en formato JSON."""
        metadata = {
            "workflowId": result.workflow_id,
            "prompt": result.prompt,
            "createdAt": result.created_at.isoformat(),
            "provider": result.provider,
            "status": result.status,
            "imagePath": result.image_path,
            "version": result.version
        }
        
        # Añadir campos opcionales si existen
        if result.error:
            metadata["error"] = result.error
        
        if result.provider_metadata:
            metadata["providerMetadata"] = result.provider_metadata
            
        metadata_file = os.path.join(workflow_dir, "metadata.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def _copy_image_to_workflow_dir(self, workflow_dir: str, image_path: str) -> None:
        """Copia la imagen al directorio del workflow con el nombre image.png."""
        if os.path.exists(image_path):
            # Obtener el nombre del archivo original
            filename = os.path.basename(image_path)
            
            # Si es diferente de image.png, copiarlo con ese nombre
            if filename != "image.png":
                destination_path = os.path.join(workflow_dir, "image.png")
                import shutil
                shutil.copy2(image_path, destination_path)
            else:
                # Si ya es image.png, no hace falta copiar
                pass
    
    def load_workflow_artifacts(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Carga los artefactos de un workflow específico."""
        try:
            workflow_dir = os.path.join(self.base_output_dir, workflow_id)
            
            # Cargar metadata
            metadata_file = os.path.join(workflow_dir, "metadata.json")
            if not os.path.exists(metadata_file):
                return None
                
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                
            # Verificar que exista la imagen
            image_path = os.path.join(workflow_dir, "image.png")
            if not os.path.exists(image_path):
                metadata["imageExists"] = False
            else:
                metadata["imageExists"] = True
                
            return metadata
            
        except Exception as e:
            print(f"Error cargando artefactos del workflow {workflow_id}: {e}")
            return None