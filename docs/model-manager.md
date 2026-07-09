# Model Manager

## Funcionamiento del Scheduler

El Model Manager implementa un scheduler que gestiona la carga y descarga dinámica de modelos de IA según las necesidades del sistema. El scheduler funciona con los siguientes principios:

1. **Gestión Dinámica**: Los modelos se cargan y descargas automáticamente según las necesidades del workflow
2. **Priorización**: Se establece una prioridad para la carga de modelos basada en el tipo de operación requerida
3. **Control de Recursos**: Se mantiene un control estricto de los recursos disponibles (VRAM)

### Algoritmo de Carga

1. **Verificación de Recursos**: Antes de cargar un modelo, se verifica que haya suficiente VRAM disponible
2. **Priorización por Tipo**: Se priorizan modelos según el tipo de operación necesaria
3. **Carga Asincrónica**: La carga se realiza de forma asincrónica para no bloquear el sistema

### Algoritmo de Descarga

1. **Descarga Automática**: Los modelos se descargan automáticamente cuando ya no son necesarios
2. **Limpieza de Recursos**: Se asegura que los recursos se liberen correctamente tras la descarga
3. **Gestión de Memoria**: Se mantiene un registro continuo del uso de VRAM

## Gestión de VRAM

### Capacidad y Uso

El sistema implementa un control estricto de la VRAM con:

1. **Capacidad Total**: 2GB por defecto (configurable)
2. **Monitoreo Continuo**: Se realiza un seguimiento constante del uso de VRAM
3. **Límites de Carga**: No se permite cargar modelos si excederían la capacidad disponible

### Métricas de VRAM

- **VRAM Total**: 2,097,152 KB (2GB)
- **Uso Actual**: Se calcula dinámicamente
- **VRAM Disponible**: VRAM Total - Uso Actual

## Carga y Descarga de Modelos

### Proceso de Carga

1. **Solicitud de Carga**: Se solicita la carga de un modelo específico
2. **Verificación de Recursos**: Se comprueba que haya suficiente VRAM
3. **Carga Real**: Se carga el modelo en memoria (simulación de tiempo)
4. **Actualización de Estado**: Se actualiza el estado del modelo a "loaded"

### Proceso de Descarga

1. **Solicitud de Descarga**: Se solicita la descarga de un modelo específico
2. **Descarga Real**: Se libera la memoria del modelo (simulación de tiempo)
3. **Actualización de Estado**: Se actualiza el estado del modelo a "unloaded"

### Tipos de Modelos Disponibles

1. **image-generator**
   - Tipo: imagen
   - Tamaño: 500MB
   - Descripción: Genera imágenes a partir de prompts de texto

2. **3d-generator**  
   - Tipo: 3D
   - Tamaño: 1GB
   - Descripción: Genera modelos 3D a partir de imágenes

3. **model-optimizer**
   - Tipo: 3D
   - Tamaño: 200MB
   - Descripción: Optimiza modelos 3D para rendimiento

## Prioridades

### Gestión por Tipo de Modelo

El sistema gestiona prioridades basadas en el tipo de modelo:

1. **Modelos de Imagen**: Prioridad media (necesarios para la generación inicial)
2. **Modelos 3D**: Prioridad alta (necesarios para la generación final)
3. **Modelos de Optimización**: Prioridad media (necesarios para el proceso final)

### Estrategia de Carga

1. **Carga por Tipo**: Se pueden cargar múltiples modelos de un mismo tipo
2. **Control de Recursos**: La carga se realiza solo si hay espacio disponible
3. **Priorización**: Se prioriza la carga de modelos según las necesidades del workflow

### Estrategia de Descarga

1. **Descarga Automática**: Los modelos se descargan automáticamente cuando ya no son necesarios
2. **Limpieza de Memoria**: Se asegura que los recursos se liberen correctamente
3. **Gestión de Colas**: Se pueden gestionar colas de descarga para optimizar el rendimiento

## Funciones Principales

### Cargar Modelos por Tipo

```python
async def load_models_by_type(self, model_type: str) -> List[str]:
    """Cargar todos los modelos de un tipo específico"""
    # ...
```

### Descargar Modelos por Tipo

```python
async def unload_models_by_type(self, model_type: str) -> List[str]:
    """Descargar todos los modelos de un tipo específico"""
    # ...
```

### Verificar Capacidad VRAM

```python
def can_load_model(self, model_id: str) -> bool:
    """Verificar si un modelo puede cargarse dada la capacidad actual de VRAM"""
    # ...
```

### Gestión de Estado

- **Estado Actual**: Se mantiene el estado de todos los modelos (loaded/unloaded)
- **Registro de Uso**: Se lleva registro del uso de recursos
- **Notificaciones**: Se emiten notificaciones sobre cambios de estado