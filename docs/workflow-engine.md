# Workflow Engine

## Estados del Workflow

El sistema implementa un motor de workflow con los siguientes estados:

1. **CREATED** - El workflow ha sido creado pero aún no se ha iniciado
2. **GENERATING_IMAGE** - Se está generando la imagen inicial a partir del prompt
3. **WAITING_APPROVAL** - Se está esperando la aprobación del usuario sobre la imagen generada
4. **GENERATING_3D** - Se está generando el modelo 3D basado en la imagen aprobada
5. **OPTIMIZING** - Se está optimizando el modelo 3D para rendimiento
6. **COMPLETED** - El workflow ha completado exitosamente
7. **FAILED** - El workflow ha fallado en algún punto

## Transiciones de Estado

### Flujo Normal del Workflow

```
CREATED → GENERATING_IMAGE → WAITING_APPROVAL → GENERATING_3D → OPTIMIZING → COMPLETED
                              ↑
                              └─── ERROR ──→ FAILED
```

### Transiciones Especiales

1. **CANCELADO** - Puede ocurrir en cualquier estado, llevando al workflow a FAILED
2. **PAUSADO** - Puede ocurrir en cualquier estado, manteniendo el estado actual hasta que se reanude
3. **REINICIADO** - Si un workflow falla, puede ser reiniciado desde el punto de fallo

## Recuperación ante Fallos

### Mecanismos de Resiliencia

1. **Persistencia del Estado**
   - Todos los estados del workflow se guardan en disco
   - Los datos se serializan usando JSON para compatibilidad
   - Se implementa manejo de errores robusto durante la persistencia

2. **Reintentos Automáticos**
   - En caso de fallo temporal, se intenta reintentar automáticamente
   - Se implementa un mecanismo de backoff exponencial para evitar sobrecarga del sistema

3. **Notificación de Errores**
   - Los errores se registran con detalles completos
   - Se almacena el mensaje de error en el estado del workflow para diagnóstico

### Recuperación desde Fallas

1. **Al inicio del sistema**:
   - Cargar todos los workflows guardados desde disco
   - Revisar el estado de cada workflow y continuar desde donde se quedó

2. **En caso de fallo durante ejecución**:
   - Guardar estado actual antes de fallar
   - Registrar error con contexto completo
   - Establecer estado como FAILED para notificación al usuario

## Persistencia

### Almacenamiento en Disco

El sistema implementa persistencia del workflow usando el siguiente enfoque:

1. **Directorio de Persistencia**: `workflows/`
2. **Formato de Archivo**: JSON
3. **Nombres de Archivos**: `{workflow_id}.json`

### Estructura del Estado Guardado

```json
{
  "workflow_id": "uuid",
  "status": "GENERATING_IMAGE",
  "current_step": "GENERATING_IMAGE",
  "steps": [
    {
      "step": "GENERATING_IMAGE",
      "status": "completed",
      "started_at": "2026-07-09T01:00:00.000Z",
      "completed_at": "2026-07-09T01:00:05.000Z"
    }
  ],
  "created_at": "2026-07-09T01:00:00.000Z",
  "updated_at": "2026-07-09T01:00:05.000Z",
  "result": null,
  "error_message": null
}
```

### Procesos de Guardado

1. **Durante Ejecución**:
   - Cada cambio de estado se persiste inmediatamente
   - Se actualiza el archivo correspondiente en disco

2. **Al Finalizar**:
   - El resultado final del workflow se almacena en el archivo
   - Se marca el estado como COMPLETED o FAILED según sea necesario

### Recuperación de Workflows

1. **Inicialización del Sistema**:
   - Se buscan todos los archivos `.json` en el directorio `workflows/`
   - Cada workflow se carga y se restaura en memoria
   - Se revisan los estados para continuar desde el punto adecuado

2. **Consulta de Estado**:
   - Se permite consultar el estado de un workflow específico
   - Si el workflow no existe en memoria, se carga desde disco