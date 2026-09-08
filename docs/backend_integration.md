# Namma Space - Backend & Model Delivery Integration

**Document Version:** 1.1.0  
**Phase:** Day 3 — Backend API & 3D Model Delivery Pipeline  
**Lead:** Member 4 (Backend Engineering & System Integration)

---

## 1. Backend Architecture

The Namma Space backend is a high-performance, modular REST service built with **Node.js**, **Express**, and **TypeScript** running on port 5001. It serves spatial metadata, POI annotations, and streams heavy 3D digital twin binary assets (`.glb`, `.gltf`, `.obj`).

### Architectural Topology

```
Browser
   ↓
React
   ↓
API request
   ↓
Express
   ↓
Model Service
   ↓
data/processed/
   ↓
GLB
   ↓
Three.js
   ↓
3D Viewer
```

### Layer Responsibilities

1. **Browser**: Client host running WebGL 2.0 and HTML5 PointerLock API.
2. **React**: Application UI state, modals (`ModelSelector`), and HUD telemetry overlays.
3. **API Request**: HTTP asynchronous fetch queries directed to `http://localhost:5001`.
4. **Express (`backend/src/index.ts`)**: HTTP middleware pipeline with permissive CORS (`*`), JSON body parsing, and routing.
5. **Model Service (`backend/src/services/modelService.ts`)**: Business logic layer validating filenames, enforcing path traversal security, and resolving asset metadata.
6. **`data/processed/`**: Filesystem storage for verified post-reconstruction 3D model artifacts.
7. **GLB / 3D Asset**: Web-optimized binary glTF 2.0 asset packaging geometry, textures, and material shaders.
8. **Three.js (`useModelLoader.ts`)**: Parses binary buffer via `GLTFLoader`, computes vertex/triangle counts and bounding boxes.
9. **3D Viewer (`ViewerCanvas.tsx`)**: Attaches model to active `THREE.Scene`, normalizes ground position ($Y=0$), and provides first-person WASD exploration.

---

## 2. API Endpoints

### 2.1 System & Health
* **`GET /`**: Service identity, version, and route directory.
* **`GET /api/health`**: Health status check returning `{ status: 'ok', service: 'namma-space-backend', timestamp: '...' }`.

### 2.2 Model Serving Endpoints
* **`GET /api/models`**:
  * Scans `data/processed/` for `.glb`, `.gltf`, `.obj`, `.ply` models.
  * Returns:
    ```json
    {
      "models": [
        {
          "id": "twin.glb",
          "name": "twin.glb",
          "format": "glb",
          "path": "/models/twin.glb",
          "sizeBytes": 12582912,
          "updatedAt": "2026-09-08T10:00:00.000Z"
        }
      ],
      "processedDir": "/absolute/path/to/data/processed"
    }
    ```
* **`GET /api/models/:id`**:
  * Retrieves metadata for a specific model ID.
  * Validates model format and guards against path traversal.
  * Returns `200 OK` with model metadata, `400 Bad Request` on invalid ID, or `404 Not Found` if missing.
* **`GET /api/models/:id/file`**:
  * Directly streams the model binary with appropriate `Content-Type` header (`model/gltf-binary` for `.glb`).
* **`GET /models/:filename`**:
  * Direct high-throughput static asset streaming via `express.static` with caching headers and CORS.

---

## 3. Model-Serving Flow

1. The Python reconstruction pipeline outputs an optimized `.glb` file into `data/processed/<name>.glb`.
2. The user opens the 3D Viewer and clicks **"Load 3D Model"**.
3. `ModelSelector.tsx` issues `GET http://localhost:5001/api/models`.
4. `ModelService.listModels()` reads `data/processed/`, formats metadata, and returns JSON.
5. The user clicks a model in the catalog list.
6. The frontend calls `loadFromUrl('http://localhost:5001/models/<name>.glb')`.
7. `GLTFLoader` fetches the binary stream over HTTP.
8. `ViewerCanvas.tsx` mounts the mesh, centers it on the ground plane, and positions the camera.

---

## 4. Frontend Integration

* **Model Ingestion Component**: [`frontend/src/components/Viewer/ModelSelector.tsx`](file:///Users/aryankumarshaw/Documents/NAMMA%20SPACE/frontend/src/components/Viewer/ModelSelector.tsx)
  * Fetches backend models automatically on modal trigger.
  * Clearly distinguishes between "Backend offline" and "No models yet in `data/processed/`".
  * Allows manual drag-and-drop fallback for local `.glb`/`.obj` files.
* **Three.js Loader Hook**: [`frontend/src/hooks/useModelLoader.ts`](file:///Users/aryankumarshaw/Documents/NAMMA%20SPACE/frontend/src/hooks/useModelLoader.ts)
  * Supports asynchronous loading of remote URLs and local `File` objects.
  * Progress calculation tracking byte transfer.
  * Model normalization, bounding box extraction, and vertex/face telemetry.

---

## 5. Error Handling

| Scenario | Handled By | Response / Behavior |
|---|---|---|
| **Backend Unreachable** | `ModelSelector.tsx` | Catches network exception; renders guidance notice to start backend server. |
| **Model Not Found (404)** | `models.ts` / `useModelLoader.ts` | Backend returns `{ error: 'Model not found', id: '...' }`; frontend catches 404 and displays toast alert. |
| **Path Traversal Attack** | `modelService.ts` | Rejects `..`, `/`, `\`, null bytes; returns `400 Bad Request`. |
| **Unsupported File Format** | `modelService.ts` | Enforces whitelist (`.glb`, `.gltf`, `.obj`, `.ply`); returns `400 Bad Request`. |
| **Corrupted 3D Asset** | `useModelLoader.ts` | `GLTFLoader` error callback triggers, sets `error` state, and dismisses loading spinner. |
| **Empty `data/processed/`** | `ModelService.ts` | Returns `{ models: [], processedDir }` without throwing. |

---

## 6. Security Considerations

1. **Path Traversal Prevention**:
   - `ModelService.sanitizeModelId()` strictly forbids directory traversal patterns (`..`, `/`, `\`, `\0`).
   - Resolves canonical paths using `path.resolve` and verifies that paths start with `path.resolve(processedDir)`.
2. **Format Whitelisting**:
   - Only `.glb`, `.gltf`, `.obj`, and `.ply` files can be requested or listed.
   - Non-3D files (e.g. `.env`, `.ts`, `.json`) are rejected with `400 Bad Request`.
3. **Static Server Hardening**:
   - `express.static` is configured with `{ dotfiles: 'ignore', index: false }`, preventing access to hidden system files or directory indexes.
4. **CORS Governance**:
   - `cors({ origin: '*' })` is explicitly mounted prior to static asset and API route handlers.

---

## 7. Local Development Commands

### Automated Launcher (Concurrent)
```bash
./scripts/run_dev.sh
```

### Backend Commands
```bash
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Compile production build to dist/
npm run build

# Run production server
npm start
```

### Frontend Commands
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Compile TypeScript and Vite production build
npm run build
```
