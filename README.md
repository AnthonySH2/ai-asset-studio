# AI Asset Studio

AI Asset Studio es un sistema de generación automatizada de activos 3D mediante inteligencia artificial, basado en el protocolo Model Context Protocol (MCP).

## Arquitectura

El sistema está compuesto por varios componentes interconectados:

1. **MCP Server**: El servidor principal que expone herramientas para la generación de activos
2. **Orchestrator**: Orquestador del workflow que coordina los pasos de generación
3. **Model Manager**: Gestor de modelos que carga y descarga dinámicamente los modelos de IA necesarios

## Componentes

### MCP Server
- Expone herramientas para la generación de imágenes y modelos 3D
- Implementa el protocolo MCP para integración con clientes
- Proporciona una interfaz consistente para todas las operaciones de generación

### Orchestrator
- Coordina el flujo completo de trabajo (prompt → imagen → modelo 3D → optimización)
- Gestiona colas de trabajos y estados de tareas
- Soporta cancelación, pausa y reanudación de tareas
- Implementa persistencia del estado del workflow

### Model Manager
- Carga y descarga dinámica de modelos de IA
- Gestión de recursos de modelo (memoria, tamaño, tipo)
- Soporte para múltiples tipos de modelos (imagen, 3D, animación)

## Flujo de Trabajo

1. El usuario proporciona un prompt
2. El MCP Server genera una imagen inicial
3. El usuario aprueba o solicita iteraciones de la imagen
4. El sistema genera un modelo 3D a partir de la imagen
5. El modelo se optimiza para el formato final
6. Se devuelven los archivos:
   - `image.png`
   - `model.glb` 
   - `metadata.json`

## Tecnologías

- **Node.js** y **TypeScript** para el MCP Server
- **Python** y **FastAPI** para el orchestrator
- **Docker** para contenerización (opcional)
- **Model Context Protocol SDK** para la integración MCP

## Características

- Carga y descarga dinámica de modelos
- Cola de trabajos
- Trabajos asíncronos
- Cancelación de tareas
- Persistencia del estado del workflow
- Reanudación después de errores