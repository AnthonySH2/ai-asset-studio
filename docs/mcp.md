# MCP (Model Context Protocol)

## Herramientas Exposadas

El sistema expone varias herramientas a través del protocolo Model Context Protocol (MCP) que permiten la generación automatizada de activos 3D. Estas herramientas son accesibles desde clientes compatibles con MCP.

### 1. generate-image

**Descripción**: Genera una imagen inicial a partir de un prompt de texto.

**Parámetros de Entrada**:
- `prompt` (string, requerido): Descripción del contenido deseado
- `style` (string, opcional): Estilo artístico (realista, cartoon, etc.)
- `size` (string, opcional): Tamaño de la imagen (512x512, 1024x1024, etc.)

**Parámetros de Salida**:
- `image_url` (string): URL de la imagen generada
- `metadata` (object): Metadatos adicionales de la imagen

### 2. generate-3d-model

**Descripción**: Genera un modelo 3D a partir de una imagen proporcionada.

**Parámetros de Entrada**:
- `image_url` (string, requerido): URL de la imagen base
- `model_name` (string, opcional): Nombre del modelo 3D
- `optimization_level` (string, opcional): Nivel de optimización (low, medium, high)

**Parámetros de Salida**:
- `model_url` (string): URL del modelo 3D generado
- `metadata` (object): Metadatos adicionales del modelo

### 3. optimize-model

**Descripción**: Optimiza un modelo 3D para mejorar su rendimiento.

**Parámetros de Entrada**:
- `model_url` (string, requerido): URL del modelo a optimizar
- `target_format` (string, opcional): Formato objetivo (glb, gltf, obj)
- `quality` (string, opcional): Calidad de la optimización (low, medium, high)

**Parámetros de Salida**:
- `optimized_model_url` (string): URL del modelo optimizado
- `metadata` (object): Metadatos adicionales de la optimización

## Comunicación con el Orchestrator

El MCP Server se comunica con el Orchestrator mediante llamadas HTTP a una API REST específica. Esta comunicación es fundamental para coordinar los pasos del workflow.

### Flujo de Comunicación

1. **Solicitud de Workflow**: El MCP Server inicia un nuevo workflow en el Orchestrator
2. **Coordinación de Pasos**: El Orchestrator coordina los diferentes pasos del proceso
3. **Notificaciones de Estado**: El Orchestrator notifica al MCP Server sobre el progreso del workflow
4. **Entrega de Resultados**: Los resultados finales se devuelven al MCP Server

### Endpoints del Orchestrator

#### POST /workflows
- **Descripción**: Inicia un nuevo workflow
- **Parámetros**: 
  - `prompt` (string): Prompt para la generación inicial
  - `steps` (array): Lista de pasos a ejecutar

#### GET /workflows/{workflow_id}
- **Descripción**: Obtiene el estado actual de un workflow
- **Parámetros**: 
  - `workflow_id` (string): ID único del workflow

#### PUT /workflows/{workflow_id}/cancel
- **Descripción**: Cancela un workflow en ejecución
- **Parámetros**: 
  - `workflow_id` (string): ID único del workflow

## Registro de Nuevas Herramientas

### Proceso de Registro

1. **Creación de la Herramienta**:
   - Implementar la función que realiza la operación específica
   - Definir los parámetros de entrada y salida
   - Escribir documentación detallada

2. **Registro en el MCP Server**:
   - Añadir la herramienta al registro de herramientas del servidor
   - Configurar los metadatos de la herramienta (nombre, descripción, parámetros)
   - Establecer la ruta de acceso a la función

3. **Pruebas Unitarias**:
   - Escribir pruebas para validar el funcionamiento
   - Verificar que los parámetros se manejen correctamente
   - Asegurar que los resultados se devuelvan en el formato esperado

### Ejemplo de Registro de Herramienta

```javascript
// Ejemplo de registro de una nueva herramienta
const newTool = {
  name: "generate-animation",
  description: "Genera animaciones a partir de modelos 3D",
  parameters: {
    model_url: { type: "string", required: true },
    duration: { type: "number", required: false },
    style: { type: "string", required: false }
  },
  handler: generateAnimationHandler
};

mcpServer.registerTool(newTool);
```

### Requisitos para Nuevas Herramientas

1. **Compatibilidad con MCP**: La herramienta debe seguir el protocolo MCP
2. **Documentación**: Debe incluir descripción clara, parámetros y ejemplos de uso
3. **Manejo de Errores**: Debe tener manejo robusto de errores y excepciones
4. **Validación de Entradas**: Se deben validar los parámetros de entrada
5. **Rendimiento**: La herramienta debe ser eficiente en términos de tiempo de ejecución

### Consideraciones de Seguridad

1. **Autenticación**: Todas las llamadas a herramientas deben estar autenticadas
2. **Validación de Entrada**: Se validan todos los parámetros de entrada
3. **Límites de Recursos**: Se establecen límites para evitar uso excesivo de recursos
4. **Auditoría**: Se registran todas las llamadas para auditoría y seguimiento

## Extensibilidad del Sistema

El sistema está diseñado para ser altamente extensible, permitiendo agregar nuevas herramientas sin modificar el código existente.

### Mecanismos de Extensión

1. **Plugin System**: Soporte para plugins que añaden nuevas herramientas
2. **API REST**: Interfaz REST para integración con sistemas externos
3. **Event Driven**: Sistema basado en eventos para fácil integración

### Gestión de Versiones

1. **Compatibilidad hacia atrás**: Las nuevas herramientas mantienen compatibilidad
2. **Documentación actualizada**: Se actualiza la documentación con cada nueva herramienta
3. **Migración automática**: Procesos de migración automáticos cuando sea necesario