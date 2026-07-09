# Reglas de Desarrollo para AI Asset Studio

## Antes de cualquier tarea

Antes de comenzar cualquier tarea de desarrollo, es obligatorio:

1. **Leer el documento de contexto del proyecto**
   - `docs/project-context.md`
   - Comprender la arquitectura actual y las decisiones de diseño

2. **Revisar la arquitectura del sistema**
   - `docs/architecture.md`
   - Entender los componentes y sus interacciones

3. **Consultar las convenciones de desarrollo**
   - `docs/conventions.md`
   - Aplicar las normas de naming, patrones de diseño y estándares de codificación

4. **Evaluar el roadmap actual**
   - `docs/roadmap.md`
   - Asegurarse de que la implementación esté alineada con el plan de desarrollo

## Reglas Generales

### No asumir nueva arquitectura
- No crear nuevas estructuras o componentes sin una justificación clara
- Todo cambio debe encajar dentro de la arquitectura existente
- Evitar la introducción de dependencias no necesarias

### No duplicar tipos
- Reutilizar tipos y estructuras existentes cuando sea posible
- Si es necesario crear nuevos tipos, documentarlos claramente
- Mantener consistencia en los nombres y definiciones de tipos

### No crear carpetas sin justificación
- Solo crear nuevas carpetas cuando sean necesarias para la funcionalidad
- Todas las nuevas carpetas deben seguir las convenciones de nombre del proyecto
- Documentar el propósito de cada nueva carpeta creada

## Procedimiento de Análisis

### Paso 1: Revisión de contexto
Antes de cualquier modificación:
1. Leer `docs/project-context.md` completamente
2. Entender los objetivos y tecnologías utilizadas
3. Identificar las decisiones de diseño clave

### Paso 2: Análisis de arquitectura
Revisar:
1. `docs/architecture.md` para entender la estructura del sistema
2. Componentes existentes y sus responsabilidades
3. Diagramas de flujo y dependencias

### Paso 3: Verificación de convenciones
Consultar:
1. `docs/conventions.md` para estándares de codificación
2. Patrones de diseño implementados
3. Convenciones de nombres y estructura de carpetas

### Paso 4: Alineación con roadmap
Verificar:
1. `docs/roadmap.md` para el estado actual del proyecto
2. Funcionalidades pendientes relevantes
3. Orden recomendado de implementación

## Consideraciones Específicas

### Para el desarrollo de nuevas funcionalidades
- Evaluar si la nueva funcionalidad puede integrarse en componentes existentes
- No introducir cambios que rompan la compatibilidad con versiones anteriores
- Mantener consistencia en la comunicación entre componentes (HTTP/REST)

### Para la gestión de recursos
- Aplicar las reglas de gestión de VRAM establecidas
- Seguir los estándares de persistencia definidos
- Implementar mecanismos de manejo de errores consistentes

### Para pruebas y documentación
- Mantener actualizada la documentación de cada nueva funcionalidad
- Incluir ejemplos de uso en las nuevas implementaciones
- Asegurar que todas las herramientas sigan el formato definido por MCP