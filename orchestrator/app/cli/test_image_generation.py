#!/usr/bin/env python3
"""
Script de prueba para la generación de imágenes usando el workflow mock.
Este script ejecuta el flujo completo de generación de imagen con un prompt específico.
"""

import os
import sys
from datetime import datetime

# Añadir el directorio del proyecto al path para poder importar los módulos
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from orchestrator.app.services.mock_image_provider import MockImageProvider
from orchestrator.app.services.image_storage_service import ImageStorageService
from orchestrator.app.services.image_workflow import ImageWorkflow
from orchestrator.app.models.image_generation_request import ImageGenerationRequest

def main():
    """Función principal para ejecutar la prueba de generación de imagen."""
    print("=== Prueba de Generación de Imagen ===")
    
    # Crear instancias de los servicios
    provider = MockImageProvider()
    storage_service = ImageStorageService()
    
    # Crear workflow
    workflow = ImageWorkflow(provider, storage_service)
    
    # Crear solicitud de generación
    request = ImageGenerationRequest(
        prompt="Un paisaje con un lago",
        style="realista",
        size="512x512"
    )
    
    print(f"Solicitud: {request.prompt}")
    print(f"Estilo: {request.style}")
    print(f"Tamaño: {request.size}")
    
    # Ejecutar el workflow
    print("\nIniciando workflow...")
    result = workflow.execute(request)
    
    # Mostrar resultado
    print(f"\n=== Resultado ===")
    print(f"Workflow ID: {result.workflow_id}")
    print(f"Prompt: {result.prompt}")
    print(f"Proveedor: {result.provider}")
    print(f"Estado: {result.status}")
    print(f"Ruta de imagen: {result.image_path}")
    print(f"Creado: {result.created_at}")
    
    if result.error:
        print(f"Error: {result.error}")
    
    # Verificar que los archivos se hayan creado
    workflow_dir = os.path.join("workflows", result.workflow_id)
    image_file = os.path.join(workflow_dir, "image.png")
    metadata_file = os.path.join(workflow_dir, "metadata.json")
    
    print(f"\n=== Archivos generados ===")
    print(f"Directorio del workflow: {workflow_dir}")
    print(f"Imagen creada: {os.path.exists(image_file)}")
    print(f"Metadata creada: {os.path.exists(metadata_file)}")
    
    if os.path.exists(metadata_file):
        with open(metadata_file, 'r') as f:
            import json
            metadata = json.load(f)
            print("\n=== Metadata ===")
            for key, value in metadata.items():
                print(f"{key}: {value}")

if __name__ == "__main__":
    main()