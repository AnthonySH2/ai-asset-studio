# Plan de Trabajo — AI Asset Studio

> **Qué es este documento:** plan de ejecución paso a paso para poner en marcha la generación de imágenes a partir de texto (text-to-image) en este repo. Incluye dónde vive toda la documentación, el estado actual del código y las instrucciones concretas para empezar, continuar y finalizar.
>
> **Ubicación de este documento:** `D:\Anthony\Projects\ai-asset-studio\docs\plan.md`
> **Última actualización:** 10/03/2026

---

## 1. Mapa de documentación (dónde está todo)

Toda la documentación del proyecto vive en la carpeta `docs/` de la raíz del repo
(`D:\Anthony\Projects\ai-asset-studio\docs\`):

| Documento | Ruta | Qué contiene | Cuándo leerlo |
|---|---|---|---|
| **Plan de trabajo (este)** | `docs/plan.md` | Plan de ejecución paso a paso para text-to-image | **Primero**: antes de tocar nada |
| Resumen ejecutivo | `docs/project-context.md` | Visión general, objetivos y alcance del proyecto | Para entender el "por qué" del proyecto |
| Arquitectura | `docs/architecture.md` | Componentes (MCP Server, Orchestrator, Model Manager) y cómo se conectan | Antes de modificar cualquier componente |
| Workflow Engine | `docs/workflow-engine.md` | Máquina de estados del workflow (CREATED → GENERATING_IMAGE → … → COMPLETED) | Antes de tocar `image_workflow.py` |
| MCP | `docs/mcp.md` | Herramientas expuestas por el MCP Server (`generate-image`, `generate-3d-model`, etc.) | Antes de trabajar en `mcp-server/` |
| Model Manager | `docs/model-manager.md` | Scheduler de carga/descarga de modelos y control de VRAM | Antes de trabajar en `ModelManager.ts` |
| Convenciones | `docs/conventions.md` | Estructura de carpetas, estilos de código y reglas del proyecto | **Antes de escribir código** |
| Roadmap | `docs/roadmap.md` | Estado actual y fases futuras del proyecto | Para planificar el siguiente hito |
| README | `README.md` (raíz) | Punto de entrada general del repo | Primer contacto con el proyecto |

**Documentación externa relevante** (fuera de este repo):

| Documento | Ruta | Qué contiene |
|---|---|---|
| Ficha de la PC2 | `D:\Anthony\Projects\anthony-workstation\docs\pc2-system-info.md` | Hardware de la máquina de trabajo: RTX 4070 Ti SUPER (16 GB VRAM), i5-12400, 64 GB RAM. **Incluye el presupuesto de VRAM**: el modelo Ollama (Qwen 27B Q3_K_M, ~14 GB) y Flux **no caben a la vez** en la GPU — hay que descargar el modelo de Ollama antes de cargar Flux. |

**Regla de oro de documentación:** cualquier cambio de comportamiento, nueva herramienta MCP o cambio de arquitectura debe reflejarse en el documento correspondiente de `docs/` en el mismo commit.

---

## 2. Estado actual del repo

### Lo que SÍ funciona hoy
- **Pipeline mock completo de text-to-image** en Python (`orchestrator/`):
  - `app/services/i_image_provider.py` — interfaz `IImageProvider` (contrato)
  - `app/services/mock_image_provider.py` — `MockImageProvider` (genera un PNG 512×512 con PIL sin GPU)
  - `app/services/image_storage_service.py` — `ImageStorageService` (guarda en `output/images/`, crea carpetas)
  - `app/services/image_workflow.py` — `ImageWorkflow` (orquesta: prompt → provider → storage)
  - `app/cli/test_image_generation.py` — CLI de prueba: `python -m app.cli.test_image_generation "prompt"`
- **MCP Server** en TypeScript (`mcp-server/`) con las herramientas `generate-image`, `generate-3d-model`, `optimize-model`, `register-asset`, `get-asset`, `list-assets`.
- **Model Manager** en TypeScript (`orchestrator/app/services/ModelManager.ts`) con scheduler de VRAM.

### Lo que FALTA para producción
| Falta | Dónde | Impacto |
|---|---|---|
| Archivos `__init__.py` | `orchestrator/app/`, `orchestrator/app/services/`, `orchestrator/app/cli/` | El README los pide; hoy funcionan por *namespace packages* de Python 3, pero convendría crearlos para que el paquete sea explícito |
| Proveedor real de imágenes | `orchestrator/app/services/` | Solo existe el mock en Python. `FluxProvider.ts` y `OllamaProvider.ts` están en TypeScript dentro del orchestrator (mezcla de lenguajes que hay que resolver) |
| Integración MCP → Orchestrator | `mcp-server/src/services/ImageService.ts` | El MCP Server no delega aún al pipeline Python |
| Testes automatizados | — | No hay suite de tests (solo `ModelManager.test.ts`) |

### Nota sobre lenguajes mezclados
El orchestrator mezcla Python (`app/services/*.py`, `app/cli/`) y TypeScript (`app/*.ts`, `app/services/*.ts`). El plan de abajo asume que **el pipeline text-to-image se consolida en Python** (donde ya está) y que el MCP Server (Node) lo invoca vía subprocesso o API.

### Repo git
- Remoto: `https://github.com/AnthonySH2/ai-asset-studio.git` (origin)
- Estado: limpio en el último chequeo (sin cambios pendientes)

---

## 3. Objetivo

Generar una imagen a partir de una frase —p. ej. **"un cisne en un lago"**— de forma verificable, en dos niveles:

1. **Nivel mock (rápido, sin GPU):** pipeline completo con `MockImageProvider`.
2. **Nivel real (con GPU):** pipeline con Flux vía Ollama o diffusers.

---

## 4. Fase 0 — Preparación del entorno (~15 min)

```powershell
# 1. Ir al repo
cd D:\Anthony\Projects\ai-asset-studio

# 2. Verificar Python (mínimo 3.10)
python --version

# 3. Crear entorno virtual en la raíz del repo
python -m venv .venv

# 4. Activarlo (PowerShell)
.\.venv\Scripts\Activate.ps1

# 5. Instalar dependencias del orchestrator
pip install -r orchestrator\requirements.txt
#    (fastapi, uvicorn, pydantic, httpx, pillow)

# 6. Verificar Node.js (mínimo 18) para el MCP Server
node --version
```

**Criterio de salida:** `python --version` ≥ 3.10, venv activado, `pip install` sin errores, `node --version` ≥ 18.

### Hito 0 — Entorno listo

- **Tarea de Cline:** ejecutar los comandos de la Fase 0 (crear `.venv`, activarlo, `pip install -r orchestrator/requirements.txt`, verificar `node --version`).
- **Verificación independiente:**
  - `python --version` devuelve ≥ 3.10.
  - `node --version` devuelve ≥ 18.
  - `.venv` existe y está activado.
  - `pip show fastapi uvicorn pydantic httpx pillow` → los 5 paquetes instalados.
- **Commit:**
  ```powershell
  git add .gitignore orchestrator/requirements.txt docs/plan.md
  git commit -m "chore: entorno (venv + dependencias) y plan de trabajo"
  git push origin main
  ```

---

## 5. Fase 1 — Estructura de paquetes (~5 min)

Crear los `__init__.py` que pide el README (uno vacío en cada paquete):

```
orchestrator/app/__init__.py
orchestrator/app/services/__init__.py
orchestrator/app/cli/__init__.py
```

En PowerShell:

```powershell
New-Item -Path orchestrator\app\__init__.py -ItemType File -Force
New-Item -Path orchestrator\app\services\__init__.py -ItemType File -Force
New-Item -Path orchestrator\app\cli\__init__.py -ItemType File -Force
```

**Criterio de salida:** los 3 archivos existen (pueden estar vacíos).

### Hito 1 — Estructura de paquetes

- **Tarea de Cline:** crear los 3 `__init__.py` (`orchestrator/app/`, `orchestrator/app/services/`, `orchestrator/app/cli/`).
- **Verificación independiente:**
  - `Test-Path` sobre las 3 rutas devuelve `True`.
  - Desde `orchestrator/`: `python -c "import app.services, app.cli"` → sin errores.
- **Commit:**
  ```powershell
  git add orchestrator/app/__init__.py orchestrator/app/services/__init__.py orchestrator/app/cli/__init__.py
  git commit -m "chore: añadir __init__.py al paquete app"
  git push origin main
  ```

---

## 6. Fase 2 — Primer resultado con el pipeline mock (~5 min)

Ejecutar la CLI de prueba desde la carpeta `orchestrator/`:

```powershell
cd D:\Anthony\Projects\ai-asset-studio\orchestrator
python -m app.cli.test_image_generation "un cisne en un lago"
```

Salida esperada en consola:

```
=== Generación de Imagen ===
Prompt: un cisne en un lago

[Pas 1/3] Generando imagen...
  Imagen generada: 512x512, 3 bytes
[Pas 2/3] Guardando imagen...
  Imagen guardada: D:\...\orchestrator\output\images\<timestamp>_un_cisne_en_un_lago.png
[Pas 3/3] Workflow completado
```


**Criterio de salida:** código de salida 0 y un archivo `.png` nuevo en `orchestrator/output/images/`.

> Si falla con `ModuleNotFoundError: app` → ejecuta el comando desde dentro de `orchestrator/` (no desde la raíz) o exporta `PYTHONPATH=D:\Anthony\Projects\ai-asset-studio\orchestrator`.

### Hito 2 — Primer resultado (pipeline mock)

- **Tarea de Cline:** ejecutar `python -m app.cli.test_image_generation "un cisne en un lago"` desde `orchestrator/`.
- **Verificación independiente:**
  - Código de salida `0`.
  - La consola muestra los 3 pasos (`[Pas 1/3]`, `[Pas 2/3]`, `[Pas 3/3]`).
  - Existe un `.png` nuevo en `orchestrator/output/images/` con nombre `<timestamp>_un_cisne_en_un_lago.png`.
  - **Este es el primer hito end-to-end: ya hay una imagen en `output/images/`.**
- **Commit:**
  ```powershell
  git add .gitignore
  git commit -m "test: primer resultado del pipeline text-to-image (mock)"
  git push origin main
  ```

---

## 7. Fase 3 — Verificación del resultado (~5 min)

```powershell
# 1. Listar la imagen generada (la más reciente)
Get-ChildItem D:\Anthony\Projects\ai-asset-studio\orchestrator\output\images\*.png |
  Sort-Object LastWriteTime -Descending | Select-Object -First 3 Name, Length, LastWriteTime

# 2. Abrirla para inspección visual
explorer /select,"D:\Anthony\Projects\ai-asset-studio\orchestrator\output\images\<archivo.png>"
```

**Criterio de salida:** el PNG abre correctamente (con el mock será un placeholder gris con texto, no una imagen real — es esperable).

### Hito 3 — Verificación del PNG

- **Tarea de Cline:** listar el PNG más reciente y abrirlo para inspección visual.
- **Verificación independiente:**
  - El PNG es un archivo de imagen válido: `python -c "from PIL import Image; im=Image.open('<archivo.png>'); print(im.format, im.size, im.mode)"` → `(PNG, (512, 512), ...)`.
  - Visualmente es un placeholder gris con texto (esperado con `MockImageProvider`).
- **Commit:** fase de verificación (no introduce código nuevo → sin commit).

---

## 8. Fase 4 — Proveedor real con Flux (~1-2 h, requiere GPU)

> **Advertencia de VRAM** (de `anthony-workstation/docs/pc2-system-info.md`): la PC2 tiene 16 GB de VRAM. El modelo Ollama activo (Qwen 27B Q3_K_M, ~14 GB) **no cabe junto con Flux**. Antes de cargar Flux:
>
> ```powershell
> ollama list
> ollama stop smtek/Qwen3.8-27B:Q3_K_M   # o el modelo que esté cargado
> ```

### Opción A — Flux vía Ollama (recomendada, sin instalar torch)
```powershell
# Descargar el modelo Flux (una sola vez)
ollama pull flux
# Probarlo directamente
ollama run flux "un cisne en un lago"
```
Después, crear `orchestrator/app/services/flux_ollama_provider.py` implementando `IImageProvider` (mismo contrato que `mock_image_provider.py`) que llame a `ollama run flux <prompt>` por subprocesso y devuelva `ImageResult`.

### Opción B — Flux vía diffusers (más control, más pesado)
```powershell
pip install torch diffusers transformers accelerate safetensors
huggingface-cli login        # FLUX.1-dev es un modelo "gated": requiere token
```
Crear `orchestrator/app/services/flux_provider.py` que use `FluxPipeline.from_pretrained("black-forest-labs/FLUX.1-dev", torch_dtype=torch.float8_e4m3fn)` (el fp8 cabe en los 16 GB de la 4070 Ti SUPER).

### Conectar el proveedor real al workflow
En `orchestrator/app/cli/test_image_generation.py` (o en un `main.py` nuevo), sustituir:
```python
provider = MockImageProvider()
```
por el proveedor real, p. ej. `provider = FluxOllamaProvider()`. El resto del pipeline (`ImageWorkflow`, `ImageStorageService`) **no cambia**: para eso existe la interfaz `IImageProvider`.

**Criterio de salida:** `python -m app.cli.test_image_generation "un cisne en un lago"` genera un PNG *real* (con un cisne) en `output/images/`.

### Hito 4 — Proveedor real (Flux)

- **Tarea de Cline:** implementar el proveedor real (Opción A: `flux_ollama_provider.py` vía Ollama — recomendada; o Opción B: `flux_provider.py` vía diffusers) implementando `IImageProvider`, y conectarlo al workflow sustituyendo `MockImageProvider()` en `test_image_generation.py`.
- **Verificación independiente:**
  - `python -m app.cli.test_image_generation "un cisne en un lago"` termina con código `0` y genera un PNG **real** (no el placeholder gris del mock).
  - **Inspección visual:** el PNG muestra efectivamente un cisne en un lago.
  - El resto del pipeline (`ImageWorkflow`, `ImageStorageService`) no ha cambiado (se respeta la interfaz `IImageProvider`).
- **Commit:**
  ```powershell
  git add orchestrator/app/services/<proveedor>.py orchestrator/app/cli/test_image_generation.py
  git commit -m "feat: proveedor real de imágenes (Flux) conectado al workflow"
  git push origin main
  ```

---

## 9. Fase 5 — MCP Server (~30 min)

```powershell
cd D:\Anthony\Projects\ai-asset-studio\mcp-server
npm install
npm run build     # tsc → dist/
npm start         # o: npm run dev  (ts-node, para desarrollo)
```

El server expone `generate-image` entre otras herramientas (ver `docs/mcp.md`). Para que `generate-image` use el pipeline Python real, `ImageService.ts` debe delegar al orchestrator (subproceso `python -m app.cli.test_image_generation "<prompt>"` o API HTTP). Hoy apunta a `FluxService.ts` local.

**Criterio de salida:** el server arranca sin errores y `npm run build` compila limpio.

### Hito 5 — MCP Server

- **Tarea de Cline:** `npm install`, `npm run build`, `npm start`; y hacer que `ImageService.ts` delegue al pipeline Python (subproceso `python -m app.cli.test_image_generation "<prompt>"` o API HTTP) en lugar de `FluxService.ts` local.
- **Verificación independiente:**
  - `npm run build` compila limpio (tsc → `dist/`).
  - El server arranca sin errores (`npm start`).
  - La herramienta `generate-image` delega al pipeline Python: al invocarla se produce un PNG en `orchestrator/output/images/`.
- **Commit:**
  ```powershell
  git add mcp-server/src/services/ImageService.ts mcp-server/package.json mcp-server/package-lock.json
  git commit -m "feat: MCP Server delega generate-image al pipeline Python"
  git push origin main
  ```

---

## 10. Fase 6 — Cierre (~10 min)

```powershell
cd D:\Anthony\Projects\ai-asset-studio
git add -A
git commit -m "feat: pipeline text-to-image (mock + proveedor real) y plan de trabajo"
git push origin main
```

Actualizar en el mismo commit:
- `docs/roadmap.md` → marcar la fase completada.
- `README.md` → reflejar cualquier cambio de comandos.

### Hito 6 — Cierre y test end-to-end final

- **Tarea de Cline:** actualizar `docs/roadmap.md` (marcar la fase completada) y `README.md` (reflejar cambios de comandos), y ejecutar el test end-to-end final.
- **Verificación independiente (Definition of Done):**
  - `python -m app.cli.test_image_generation "un cisne en un lago"` termina con código `0`.
  - Existe un PNG nuevo en `orchestrator/output/images/` con el nombre `<timestamp>_un_cisne_en_un_lago.png`.
  - (Nivel real) El PNG muestra efectivamente un cisne en un lago.
  - `docs/roadmap.md` actualizado.
  - **Este es el hito end-to-end completo: de la frase `"un cisne en un lago"` al PNG final.**
- **Commit (final):**
  ```powershell
  git add -A
  git commit -m "feat: pipeline text-to-image (mock + proveedor real) y plan de trabajo"
  git push origin main
  ```

---

## 11. Instrucciones de arranque: por dónde empezar

**Si empiezas de cero, haz exactamente esto, en este orden:**

1. **Lee** `docs/project-context.md` (5 min) para entender el objetivo del proyecto.
2. **Lee** `docs/conventions.md` para las reglas de estructura y estilo.
3. **Fase 0** (sección 4): venv + dependencias.
4. **Fase 1** (sección 5): los 3 `__init__.py`.
5. **Fase 2** (sección 6): ejecuta `python -m app.cli.test_image_generation "un cisne en un lago"`.
   → *Aquí está el primer hito: ya tienes una imagen en `output/images/`.*
6. **Fase 3** (sección 7): verifica el PNG.

**Cómo seguir después:**
- Fase 4: proveedor real (Ollama primero; diffusers si necesitas control fino).
- Fase 5: MCP Server.
- Fase 6: commit + push + actualizar roadmap.

**Cómo finalizar (Definition of Done):**
- [ ] `python -m app.cli.test_image_generation "un cisne en un lago"` termina con código 0.
- [ ] Existe un PNG nuevo en `orchestrator/output/images/` con el nombre `<timestamp>_un_cisne_en_un_lago.png`.
- [ ] (Nivel real) El PNG muestra efectivamente un cisne en un lago.
- [ ] `docs/roadmap.md` actualizado y commit empujado a `origin`.

---

## 12. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ModuleNotFoundError: No module named 'app'` | Comando ejecutado fuera de `orchestrator/` | `cd orchestrator` antes de ejecutar, o `set PYTHONPATH=D:\Anthony\Projects\ai-asset-studio\orchestrator` |
| `CUDA out of memory` al cargar Flux | El modelo Ollama ocupa la VRAM | `ollama stop <modelo>` antes de cargar Flux (ver `pc2-system-info.md`) |
| 401 al descargar FLUX.1-dev de HuggingFace | Modelo gated | `huggingface-cli login` con un token con acceso aceptado a `black-forest-labs/FLUX.1-dev` |
| `pillow` no encontrado | venv no activado o dependencias no instaladas | `.\.venv\Scripts\Activate.ps1` y `pip install -r orchestrator\requirements.txt` |
| El PNG del mock parece "vacío" | Es un placeholder gris por diseño | Esperado con `MockImageProvider`; para imagen real, Fase 4 |
| `npm run build` falla en mcp-server | Node < 18 o tipos faltantes | Actualizar Node; `npm install` de nuevo |

---

## 13. Referencias rápidas

- Interfaz de proveedores: `orchestrator/app/services/i_image_provider.py` (clase `IImageProvider`)
- Workflow: `orchestrator/app/services/image_workflow.py` (clase `ImageWorkflow`)
- CLI de prueba: `orchestrator/app/cli/test_image_generation.py`
- Herramientas MCP: `mcp-server/src/tools/imageTools.ts`
- Presupuesto de VRAM de la PC2: `D:\Anthony\Projects\anthony-workstation\docs\pc2-system-info.md`

---

## 14. Hitos — Resumen de tareas verificables

Cada fase del plan se cierra con un **hito** que sigue siempre la misma secuencia estricta:

> **Trabajar (Cline) → Verificación independiente → Commit + Push**

- **Trabajar:** Cline ejecuta la *Tarea de Cline* del hito.
- **Verificación independiente:** se comprueba el resultado con criterios objetivos (comandos, salida de consola, inspección visual) **antes** de commitear. Si falla, no se commitea: se corrige y se vuelve a verificar.
- **Commit + Push:** solo tras pasar la verificación, se hace `git add` de los archivos del hito, `git commit` con el mensaje indicado y `git push origin main`.

| Hito | Fase | Tarea (Cline) | Verificación independiente | Commit |
|---|---|---|---|---|
| **Hito 0** | Fase 0 | venv + dependencias (`pip install -r orchestrator/requirements.txt`) | `python` ≥ 3.10, `node` ≥ 18, 5 paquetes instalados | `chore: entorno (venv + dependencias) y plan de trabajo` |
| **Hito 1** | Fase 1 | Crear los 3 `__init__.py` | `Test-Path` = `True`; `import app.services, app.cli` sin errores | `chore: añadir __init__.py al paquete app` |
| **Hito 2** | Fase 2 | Ejecutar la CLI mock (`"un cisne en un lago"`) | Código `0`, 3 pasos en consola, PNG nuevo en `output/images/` | `test: primer resultado del pipeline text-to-image (mock)` |
| **Hito 3** | Fase 3 | Listar y abrir el PNG | `PIL` → `(PNG, (512, 512), ...)`; placeholder gris | *(sin commit — solo verificación)* |
| **Hito 4** | Fase 4 | Proveedor real Flux + conectar al workflow | Código `0`, PNG **real** con un cisne, pipeline sin cambios | `feat: proveedor real de imágenes (Flux) conectado al workflow` |
| **Hito 5** | Fase 5 | `npm install/build/start`; delegar `generate-image` al pipeline Python | `npm run build` limpio; server arranca; `generate-image` produce PNG | `feat: MCP Server delega generate-image al pipeline Python` |
| **Hito 6** | Fase 6 | Actualizar `roadmap.md` + `README.md`; test end-to-end final | Código `0`, PNG `<timestamp>_un_cisne_en_un_lago.png`, cisne visible, roadmap actualizado | `feat: pipeline text-to-image (mock + proveedor real) y plan de trabajo` |

> **Nota:** los PNG generados en `orchestrator/output/images/` **no** se commitean (están excluidos vía `.gitignore`); lo que se commitea es el código y la documentación.