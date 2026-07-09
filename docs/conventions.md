# Convenciones de Desarrollo

## Estructura de Carpetas

### Estructura General del Proyecto

```
assets-studio-mcp/
├── docs/                    # Documentación del proyecto
├── mcp-server/              # Servidor MCP (Node.js/TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── orchestrator/            # Orquestador (Python/FastAPI)
│   ├── src/
│   ├── main.py
│   └── requirements.txt
├── model-manager/           # Gestor de Modelos (Python)
│   ├── src/
│   ├── main.py
│   └── model_manager.py
└── shared/                  # Código compartido
    ├── interfaces/
    └── types/
```

### Convenciones de Nombres de Archivos

1. **Archivos de código fuente**: `camelCase` (ej: `workflowEngine.py`, `modelManager.js`)
2. **Archivos de configuración**: `kebab-case` (ej: `package.json`, `tsconfig.json`)
3. **Documentos**: `snake_case.md` (ej: `architecture.md`, `workflow_engine.md`)
4. **Tests**: `fileName.test.ts` o `fileName_test.py`

### Convenciones de Nombres de Directorios

1. **Componentes principales**: `kebab-case` (ej: `model-manager`, `mcp-server`)
2. **Código compartido**: `shared/` (para código reutilizable)
3. **Documentación**: `docs/` (para archivos de documentación)

## Naming Conventions

### Variables y Funciones

1. **Variables locales**: `camelCase`
   ```javascript
   const userName = "John";
   let isActive = true;
   ```

2. **Funciones**: `camelCase`
   ```javascript
   function generateImage(prompt, style) {
     // ...
   }
   ```

3. **Constantes**: `UPPER_SNAKE_CASE`
   ```javascript
   const MAX_RETRY_ATTEMPTS = 3;
   const DEFAULT_MODEL_SIZE = "1024x1024";
   ```

### Clases y Tipos

1. **Clases**: `PascalCase`
   ```python
   class ModelManager:
       pass
   
   class WorkflowEngine:
       pass
   ```

2. **Interfaces**: `PascalCase` con prefijo `I`
   ```typescript
   interface IWorkflowStep {
     name: string;
     status: string;
   }
   ```

3. **Tipos personalizados**: `PascalCase`
   ```typescript
   type ModelType = "image" | "3d" | "animation";
   ```

## Patrones de Diseño

### 1. Patrón de Factoría (Factory Pattern)
- Se utiliza para crear instancias de modelos de manera consistente
- Permite la extensión fácil de nuevos tipos de modelos

### 2. Patrón de Observador (Observer Pattern)
- Implementado en el sistema de notificaciones de estado
- Permite que múltiples componentes reaccionen a cambios en el workflow

### 3. Patrón de Comando (Command Pattern)
- Se utiliza para gestionar las operaciones del workflow
- Facilita la implementación de funcionalidades como cancelación y pausa

### 4. Patrón de Singleton
- Implementado en el Model Manager para garantizar una única instancia
- Se utiliza para el control centralizado de recursos

## Reglas para Futuras Implementaciones

### 1. Reutilización de Código
- **Prioridad**: Reutilizar componentes existentes antes de crear nuevos
- **Compartición**: Utilizar el directorio `shared/` para código común
- **Documentación**: Documentar todas las funciones reutilizables

### 2. Manejo de Errores
- **Consistencia**: Todos los errores deben seguir el mismo formato de excepción
- **Loggeo**: Registrar todos los errores con niveles adecuados (error, warning, info)
- **Notificación**: Implementar mecanismos de notificación de errores al usuario

### 3. Pruebas Unitarias
- **Cobertura**: Mantener una cobertura mínima del 80% en código nuevo
- **Pruebas**: Escribir pruebas para todas las funciones principales
- **Automatización**: Integrar pruebas en el pipeline de CI/CD

### 4. Documentación
- **Actualización**: Actualizar la documentación cada vez que se modifica una funcionalidad
- **Ejemplos**: Incluir ejemplos de uso para cada herramienta y función
- **Formato**: Seguir el formato establecido en los documentos existentes

### 5. Persistencia
- **Formato**: Utilizar JSON para todos los archivos de persistencia
- **Estructura**: Mantener una estructura consistente en todos los archivos guardados
- **Versionado**: Implementar versionado de formatos cuando sea necesario

## Estándares de Codificación

### JavaScript/TypeScript
1. **Indentación**: 2 espacios (no tabs)
2. **Comillas**: Usar comillas simples (`'`) para strings
3. **Declaración de variables**: Usar `const` y `let` en lugar de `var`
4. **Espaciado**: Dejar espacio después de `if`, `for`, `while`

### Python
1. **Indentación**: 4 espacios (no tabs)
2. **Comillas**: Usar comillas simples (`'`) para strings
3. **Naming**: Usar snake_case para funciones y variables
4. **Documentación**: Incluir docstrings en todas las funciones

### REST API
1. **Endpoints**: Utilizar formato `kebab-case`
2. **Métodos HTTP**: Seguir convenciones REST estándar
3. **Códigos de Estado**: Usar códigos HTTP adecuados (200, 400, 500, etc.)
4. **Formato de Respuesta**: Consistente en todos los endpoints

## Reglas Específicas del Proyecto

### 1. Comunicación entre Componentes
- **MCP Server → Orchestrator**: Uso exclusivo de llamadas HTTP/REST
- **Orchestrator → Model Manager**: Uso exclusivo de llamadas HTTP/REST
- **MCP Server → Model Manager**: Uso exclusivo de llamadas HTTP/REST

### 2. Gestión de Recursos
- **VRAM**: Implementar límites estrictos para el uso de memoria
- **Tiempo de Ejecución**: No exceder 10 segundos en operaciones críticas
- **Memoria**: Liberar recursos automáticamente al finalizar operaciones

### 3. Seguridad
- **Autenticación**: Implementar mecanismos de autenticación para todas las llamadas
- **Validación**: Validar todos los parámetros de entrada
- **Auditoría**: Registrar todas las operaciones importantes

### 4. Testing
- **Pruebas Unitarias**: Escribir pruebas para cada función principal
- **Pruebas de Integración**: Verificar la comunicación entre componentes
- **Pruebas de Regresión**: Asegurar que las nuevas implementaciones no rompan funcionalidades existentes

## Procedimientos de Desarrollo

### 1. Revisión de Código
- Todos los cambios deben ser revisados por otro desarrollador
- Se debe asegurar que se sigan las convenciones establecidas
- Se debe validar que las pruebas pasen correctamente

### 2. Control de Versiones
- Usar ramas para funcionalidades nuevas
- Hacer commits con mensajes descriptivos
- Etiquetar versiones importantes con formato semántico (v1.0.0)

### 3. Documentación
- Cada nueva funcionalidad debe incluir documentación actualizada
- Los archivos de configuración deben tener comentarios explicativos
- Se debe mantener el README.md actualizado

## Consideraciones Específicas para MCP

### 1. Herramientas
- Cada herramienta debe seguir la estructura definida por MCP
- Todos los parámetros deben estar documentados claramente
- Las herramientas deben manejar errores de forma consistente

### 2. Comunicación
- Se debe mantener la compatibilidad con versiones anteriores
- Los mensajes de error deben ser claros y útiles para el usuario final
- Se debe implementar un sistema de logging adecuado para diagnóstico