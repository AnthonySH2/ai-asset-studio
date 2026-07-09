import os
import uuid
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from orchestrator.app.services.i_image_provider import IImageProvider
from orchestrator.app.models.image_generation_request import ImageGenerationRequest
from orchestrator.app.models.image_generation_result import ImageGenerationResult
from orchestrator.app.models.workflow_status import WorkflowStatus

class MockImageProvider(IImageProvider):
    """Proveedor mock que genera imágenes placeholder válidas."""
    
    def __init__(self, output_dir: str = "workflows"):
        self.output_dir = output_dir
        self._loaded = False
    
    def load(self) -> None:
        """Carga el proveedor (en este caso no hace nada)."""
        if not self._loaded:
            print(f"MockImageProvider loaded")
            self._loaded = True
    
    def unload(self) -> None:
        """Descarga el proveedor (en este caso no hace nada)."""
        if self._loaded:
            print(f"MockImageProvider unloaded")
            self._loaded = False
    
    def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResult:
        """Genera una imagen placeholder válida a partir de una solicitud."""
        try:
            # Crear directorio si no existe
            workflow_dir = os.path.join(self.output_dir, request.workflow_id or str(uuid.uuid4()))
            os.makedirs(workflow_dir, exist_ok=True)
            
            # Generar nombre de archivo
            image_filename = "image.png"
            image_path = os.path.join(workflow_dir, image_filename)
            
            # Crear imagen placeholder
            self._create_placeholder_image(image_path, request.prompt)
            
            # Crear resultado
            result = ImageGenerationResult(
                workflow_id=request.workflow_id or str(uuid.uuid4()),
                prompt=request.prompt,
                provider="MockImageProvider",
                status=WorkflowStatus.IMAGE_GENERATED.value,
                image_path=image_path,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                version="1.0.0"
            )
            
            return result
            
        except Exception as e:
            # En caso de error, devolver resultado con error
            error_result = ImageGenerationResult(
                workflow_id=request.workflow_id or str(uuid.uuid4()),
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
    
    def _create_placeholder_image(self, image_path: str, prompt: str) -> None:
        """Crea una imagen placeholder con el prompt en el centro."""
        # Crear imagen de 512x512
        width, height = 512, 512
        image = Image.new('RGB', (width, height), color=(73, 109, 137))
        
        # Dibujar texto en el centro
        draw = ImageDraw.Draw(image)
        
        # Intentar usar una fuente disponible
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Dividir el prompt en líneas si es muy largo
        lines = self._wrap_text(prompt, 30)
        text_height = len(lines) * 30
        
        # Calcular posición para centrar el texto
        y = (height - text_height) // 2
        
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            line_width = bbox[2] - bbox[0]
            x = (width - line_width) // 2
            draw.text((x, y + i * 30), line, fill=(255, 255, 255), font=font)
        
        # Guardar imagen
        image.save(image_path, "PNG")
    
    def _wrap_text(self, text: str, max_width: int) -> list:
        """Divide el texto en líneas para mantener un ancho máximo."""
        if len(text) <= max_width:
            return [text]
        
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            if len(current_line + word) <= max_width:
                current_line += word + " "
            else:
                if current_line:
                    lines.append(current_line.strip())
                current_line = word + " "
        
        if current_line:
            lines.append(current_line.strip())
            
        return lines