# Arquitectura del Sistema

## Visión General

AI Asset Studio es un sistema de generación automatizada de activos 3D mediante inteligencia artificial, basado en el protocolo Model Context Protocol (MCP). El sistema está compuesto por varios componentes interconectados que trabajan en conjunto para proporcionar una experiencia completa de creación de activos digitales.

## Componentes

### 1. MCP Server
- **Función**: Servidor principal que expone herramientas para la generación de activos
- **Tecnología**: Node.js y TypeScript
- **Implementación**: Implementa el protocolo MCP para integración con clientes
- **Interfaz**: Proporciona una interfaz consistente para todas las operaciones de generación

### 2. Orchestrator
- **Función**: Orquestador del workflow que coordina los pasos de generación
- **Tecnología**: Python y FastAPI
- **Responsabilidades**:
  - Coordina el flujo completo de trabajo (prompt → imagen → modelo 3D → optimización)
  - Gestiona colas de trabajos y estados de tareas
  - Soporta cancelación, pausa y reanudación de tareas
  - Implementa persistencia del estado del workflow

### 3. Model Manager
- **Función**: Gestor de modelos que carga y descarga dinámicamente los modelos de IA necesarios
- **Tecnología**: Python
- **Responsabilidades**:
  - Carga y descarga dinámica de modelos de IA
  - Gestión de recursos de modelo (memoria, tamaño, tipo)
  - Soporte para múltiples tipos de modelos (imagen, 3D, animación)

## Diagramas de Flujo

### Flujo Principal del Sistema

```
Usuario → MCP Server (genera imagen) → Orchestrator (coordina workflow)
                              ↓
                        Model Manager (carga/descarga modelos)
                              ↓
                      Orchestrator (genera modelo 3D) → Optimización
                              ↓
                       Entrega de activos finales (image.png, model.glb, metadata.json)
```

### Diagrama de Componentes

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Usuario       │    │   MCP Server    │    │   Orchestrator  │
│                 │    │                 │    │                 │
│ - Prompt        │───▶│ - Expone tools  │───▶│ - Coordina      │
│ - Aprobación    │    │ - Implementa    │    │   workflow      │
│                 │    │   protocolo MCP │    │ - Gestiona colas│
│                 │    │                 │    │   de trabajos   │
└─────────────────┘    └─────────────────┘    │ - Soporta       │
                                                │   cancelación   │
                                                │ - Persistencia  │
                                                └─────────────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │  Model Manager  │
                                                │                 │
                                                │ - Carga modelos │
                                                │ - Gestiona VRAM │
                                                │ - Descarga modelos│
                                                └─────────────────┘
```

## Dependencias entre Módulos

### MCP Server → Orchestrator
- El MCP Server llama al Orchestrator para coordinar el workflow completo de generación
- Comunicación mediante llamadas HTTP a la API del Orchestrator

### Orchestrator → Model Manager
- El Orchestrator utiliza el Model Manager para cargar y descargar modelos según las necesidades del workflow
- Comunicación mediante llamadas HTTP a la API del Model Manager

### MCP Server → Model Manager
- El MCP Server puede solicitar al Model Manager cargar modelos específicos cuando se requieren para la generación de imágenes
- Comunicación mediante llamadas HTTP a la API del Model Manager

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Usuario                                    │
└─────────┬───────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│                        MCP Server                                   │
│    ┌─────────────────────────────────────────────────────────────┐   │
│    │  Protocolo Model Context Protocol                           │   │
│    │                                                             │   │
│    │  - generate-image                                           │   │
│    │  - [otros tools]                                            │   │
│    └─────────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│                      Orchestrator                                   │
│    ┌─────────────────────────────────────────────────────────────┐   │
│    │  Workflow Engine                                            │   │
│    │                                                             │   │
│    │  - Estados de workflow                                     │   │
│    │  - Transiciones                                            │   │
│    │  - Persistencia                                            │   │
│    │  - Recuperación ante fallos                                │   │
│    └─────────────────────────────────────────────────────────────┘   │
│    ┌─────────────────────────────────────────────────────────────┐   │
│    │  Job Queue Management                                       │   │
│    │                                                             │   │
│    │  - Colas de trabajos                                       │   │
│    │  - Priorización                                            │   │
│    └─────────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────┐
│                      Model Manager                                  │
│    ┌─────────────────────────────────────────────────────────────┐   │
│    │  Model Scheduler                                            │   │
│    │                                                             │   │
│    │  - Gestión de prioridades                                  │   │
│    │  - Carga/descarga de modelos                               │   │
│    │  - Gestión de VRAM                                         │   │
│    └─────────────────────────────────────────────────────────────┘   │
│    ┌─────────────────────────────────────────────────────────────┐   │
│    │  Model Repository                                           │   │
│    │                                                             │   │
│    │  - Almacenamiento de modelos                               │   │
│    │  - Gestión de versiones                                    │   │
│    └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘