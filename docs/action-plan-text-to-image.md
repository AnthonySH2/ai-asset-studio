# Action Plan — Real Text-to-Image (Flux) Integration

## Purpose

Replace the mock image providers in ai-asset-studio with real Flux inference so the pipeline produces actual images end to end.

## Current State (code audit)

- All Flux implementations are mocks:
  - `orchestrator/app/services/mock_image_provider.py` — Python `MockImageProvider` returns `https://example.com/generated/{hash}.png`.
  - `orchestrator/app/services/FluxProvider.ts` — TypeScript mock, same example.com pattern.
  - `mcp-server/src/services/FluxService.ts` — MCP mock, same pattern.
- `orchestrator/app/models/` does not exist, but `image_workflow.py`, `image_storage_service.py`, and `tests/test_image_generation.py` import from it. The Python image pipeline currently fails at import time.
- `orchestrator/requirements.txt` has no image or inference dependencies (no Pillow, no diffusers/accelerate).
- The MCP server's `generate_image` tool calls the local mock; it has no route to the orchestrator's image API.

## Target State

- A real `FluxImageProvider` in the Python orchestrator generates PNGs with Flux.
- `ImageWorkflow` → provider → `ImageStorageService` produces a real file on disk, retrievable at `/api/images/{image_id}`.
- The MCP `generate_image` tool returns real images when the orchestrator is running.
- Mock providers remain available for offline development and tests.

## Key Decisions

1. **Inference runs in the Python orchestrator.** The workflow engine, image storage, and the Python inference stack (diffusers/accelerate) all live in Python. The TypeScript MCP server stays as the MCP interface and does not host inference.
2. **Model: Flux schnell (default) / Flux dev (quality option).** fp8 weights for 16 GB VRAM. schnell ≈ 6–8 GB, dev ≈ 12 GB — both fit on the RTX 4070 Ti SUPER alone.
3. **Provider behind the existing interface.** `FluxImageProvider` implements `IImageProvider`; `ImageWorkflow` keeps calling the interface, so workflow code is unchanged.
4. **Configurable provider selection.** `ImageWorkflow` currently hardcodes `MockImageProvider()`. Add a provider factory (env var, e.g. `IMAGE_PROVIDER=flux|mock`, default `mock`) so the system works without a GPU until Flux is validated.
5. **Serialized inference.** One GPU → one inference at a time. The provider uses a lock/queue so concurrent workflow requests do not corrupt VRAM state.

## VRAM Constraint (PC 2)

- 16 GB VRAM total.
- Ollama's loaded 27B model currently occupies ~15 GB (see `anthony-workstation/docs/pc2-system-info.md`).
- Flux cannot be loaded while the Ollama model is resident. Operational procedure: `ollama stop smtek/Qwen3.8-27B:Q3_K_M` before running Flux, or run Flux with CPU offload (slow, not recommended).

## Steps

1. **Create the missing models package.**
   - `orchestrator/app/models/__init__.py`
   - `orchestrator/app/models/image.py`: `ImageGenerationRequest`, `GeneratedImage`, `ImageGenerationResult`, `ImageGenerationError`.
   - This unblocks imports in `image_workflow.py`, `image_storage_service.py`, and the tests.

2. **Add dependencies to `orchestrator/requirements.txt`.**
   - `Pillow` (image encoding/decoding)
   - `diffusers`, `transformers`, `accelerate`, `safetensors`, `huggingface_hub`
   - `torch` (CUDA build for Windows, cu12x — driver 616.92 supports it)

3. **Implement `FluxImageProvider`.**
   - New file: `orchestrator/app/services/flux_image_provider.py`
   - Implements `IImageProvider`
   - Lazy model load: `FluxPipeline.from_pretrained(..., torch_dtype=torch.float8_e4m3fn, device_map="cuda")` on first request
   - `generate()`: run the pipeline, save PNG via `ImageStorageService`, return `GeneratedImage` with the local file path
   - `unload()`: free VRAM (`del pipeline`, `gc.collect()`, `torch.cuda.empty_cache()`)
   - Inference lock: serialize concurrent requests

4. **Wire provider selection into the workflow.**
   - `ImageWorkflow` accepts a provider instance (or factory) instead of hardcoding `MockImageProvider()`
   - `main.py` constructs the provider from the `IMAGE_PROVIDER` env var (default `mock`)

5. **Point the MCP tool at the orchestrator.**
   - `mcp-server/src/services/FluxService.ts` / `generate_image` tool: when the orchestrator is reachable, `POST /api/workflows` (type `image`) and poll `GET /api/workflows/{id}` until COMPLETED, then return the image path.
   - Keep the local mock as a fallback when the orchestrator is not running (offline development).

6. **Tests.**
   - Existing mock-based tests in `orchestrator/tests/test_image_generation.py` must pass (they do not require a GPU).
   - Add a `FluxImageProvider` unit test with a stubbed pipeline (no real inference).
   - Manual end-to-end: start the orchestrator with `IMAGE_PROVIDER=flux`, create an image workflow, verify the PNG exists on disk and is served at `/api/images/{id}`.

7. **Model download.**
   - Pre-download the Flux schnell fp8 weights (~6 GB) to the Hugging Face cache before first use.
   - Record the cache location and disk requirements in the README.

## Acceptance Criteria

- `pytest orchestrator/tests` passes on a machine without a GPU (mock provider).
- With `IMAGE_PROVIDER=flux` and the Ollama model unloaded, an end-to-end workflow produces a real PNG file, the workflow reaches `COMPLETED`, and the image is retrievable at `/api/images/{image_id}`.
- The MCP `generate_image` tool returns a real image when the orchestrator is running.
- The mock provider remains available and is the default.

## Risks

| Risk | Mitigation |
|------|-----------|
| VRAM contention with Ollama | Unload procedure documented; schnell (smaller) as the default model |
| Large model download (~6–12 GB) | Pre-download step; document disk requirements |
| Windows CUDA build issues | Pin the torch CUDA build in requirements; verify `torch.cuda.is_available()` at provider load |
| Concurrent requests corrupting inference | Inference lock in the provider |
| Missing models package breaking imports | Step 1 restores the package before any provider work |

## Out of Scope

- 3D model generation (separate pipeline)
- LoRA / fine-tuning
- Cloud inference providers
- Docker packaging of the inference stack
