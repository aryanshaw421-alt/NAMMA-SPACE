# Namma Space - Backend Architecture & Domain Contracts

**Document Version:** 1.2.0  
**Phase:** Day 4 — Clean Modular Architecture & Domain Contracts  
**Lead:** Member 4 (Senior Backend Architect & Integration Lead)

---

## 1. Backend Architecture

The Namma Space backend follows a strict **Layered Domain Architecture** enforcing clear separation of concerns across HTTP transport, routing, controller coordination, business logic services, and storage engines:

```
Request
   ↓
Middleware (CORS, Express Body Parser, Static Model Streamer)
   ↓
Routes (/api/health, /api/models, /api/pois, /api/search, /api/navigation)
   ↓
Controllers (Parameter parsing, DTO validation, status code mapping)
   ↓
Services (Business logic, file verification, path traversal validation)
   ↓
Data Storage (data/processed/ 3D binary assets, data/pois.json, Future Spatial Index)
   ↓
Centralized Error Handler (Predictable typed JSON error envelope)
```

---

## 2. Route Structure

The backend organizes endpoints around 5 dedicated architectural domains:

| Domain Route | Router File | Controller Binding | Description |
|---|---|---|---|
| `GET /` | `backend/src/index.ts` | Direct index handler | API root metadata & endpoint discovery dictionary. |
| `GET /api/health` | `backend/src/routes/health.ts` | `HealthController.getHealth` | Service health, uptime, environment, and round status. |
| `GET /api/models` | `backend/src/routes/models.ts` | `ModelController.listModels` | Catalogs available processed 3D digital twins. |
| `GET /api/models/:id` | `backend/src/routes/models.ts` | `ModelController.getModelById` | Resolves metadata for a specific 3D model. |
| `GET /api/models/:id/file` | `backend/src/routes/models.ts` | `ModelController.streamModelFile` | Streams model binary with format-specific MIME headers. |
| `GET /api/pois` | `backend/src/routes/pois.ts` | POI route handler | Lists all spatial POI annotations. |
| `GET /api/search` | `backend/src/routes/search.ts` | `SearchController.search` | Future spatial proximity & keyword search contract. |
| `POST /api/navigation/route` | `backend/src/routes/navigation.ts` | `NavigationController.calculateRoute` | Future indoor pathfinding & route calculation contract. |

---

## 3. Controller Layer (`backend/src/controllers/`)

Controllers serve as the orchestration boundary between Express HTTP requests and backend business services:
* **`HealthController`**: Generates standardized health telemetry including uptime and environment state.
* **`ModelController`**: Validates incoming model ID parameters, invokes `ModelService`, maps business results into standardized responses, and catches exceptions to forward to the centralized error middleware.
* **`SearchController`**: Exposes the standardized spatial search contract; returns `501 NOT_IMPLEMENTED` with clear integration guidance for Member 3.
* **`NavigationController`**: Exposes the indoor wayfinding contract; returns `501 NOT_IMPLEMENTED` with pathfinding schema requirements.

---

## 4. Service Layer (`backend/src/services/`)

Services contain isolated business logic independent of Express request/response objects:
* **`ModelService` (`modelService.ts`)**:
  * Resolves filesystem directory paths across runtime environments.
  * Enforces model ID sanitization and guards against path traversal.
  * Reads file statistics (`sizeBytes`, `mtime`) and builds metadata representations.
  * Formats verified file paths for binary streaming.
* **`spatialContracts.ts`**:
  * Formal TypeScript interfaces (`IPOIServiceContract`, `ISpatialSearchServiceContract`, `INavigationServiceContract`) establishing contracts for future Member 3 spatial engine algorithms.

---

## 5. Standard Response Format & Error Handling

### 5.1 Success Envelope
All JSON API responses conform to the standard success envelope:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```
*(For existing frontend components, backward-compatible top-level keys like `models` and `status` are retained alongside `data`.)*

### 5.2 Error Envelope
All operational and uncaught errors are processed through `backend/src/middleware/errorHandler.ts`:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "details": {}
  }
}
```

### 5.3 Error Class Hierarchy
* `AppError`: Base operational error class with HTTP status code and error code.
* `BadRequestError` (`400 BAD_REQUEST`): Malformed inputs, missing parameters, invalid characters.
* `NotFoundError` (`404 NOT_FOUND`): Non-existent models, missing files, undefined routes.
* `ForbiddenError` (`403 FORBIDDEN`): Unauthorized directory traversal or boundary escapes.
* `NotImplementedError` (`501 NOT_IMPLEMENTED`): Contract endpoints awaiting Phase 2 integration.

Stack traces are logged to console in development but **never** leaked to clients in HTTP responses.

---

## 6. Security Architecture

1. **Path Traversal Shield**:
   - Every user-supplied `id` is tested against forbidden characters (`..`, `/`, `\`, null byte `\0`).
   - `path.resolve` verifies that the final target path strictly begins with `data/processed/`.
2. **Strict Extension Whitelist**:
   - Only `.glb`, `.gltf`, `.obj`, and `.ply` files can be queried or streamed.
   - Any attempt to access arbitrary files (`.env`, `package.json`, `.ts`) triggers an immediate `400 BAD_REQUEST`.
3. **Static File Server Hardening**:
   - `express.static` uses `{ dotfiles: 'ignore', index: false }`, preventing discovery of hidden files (`.gitkeep`).
4. **CORS Governance**:
   - Permissive cross-origin access (`cors({ origin: '*' })`) allows the decoupled Vite frontend (`localhost:5173`) to query APIs and stream heavy WebGL assets.

---

## 7. Model-Serving Architecture

```
Reconstructed 3D Asset
         ↓
  data/processed/
         ↓
  ModelService (Sanitization & Whitelist)
         ↓
  Express Static / Binary Stream
         ↓
  React useModelLoader (GLTFLoader)
         ↓
  Three.js Scene Graph (Grounded at Y=0)
         ↓
  First-Person WebGL Roaming
```

* **MIME Types**: `.glb` is served as `model/gltf-binary`; `.gltf` as `model/gltf+json`.
* **Zero Fake Data**: If `data/processed/` is empty, the API reports an empty array gracefully. No artificial models are fabricated.

---

## 8. Future POI Integration Contract

Member 3 will integrate spatial database persistence and semantic annotations via the typed contract defined in [`backend/src/contracts/spatialContracts.ts`](file:///Users/aryankumarshaw/Documents/NAMMA%20SPACE/backend/src/contracts/spatialContracts.ts):
```ts
export interface IPOIServiceContract {
  getAllPOIs(): Promise<PointOfInterestEntity[]>;
  getPOIById(id: string): Promise<PointOfInterestEntity | null>;
  createPOI(poi: CreatePOIDTO): Promise<PointOfInterestEntity>;
  updatePOI(id: string, updates: UpdatePOIDTO): Promise<PointOfInterestEntity | null>;
  deletePOI(id: string): Promise<boolean>;
}
```

---

## 9. Future Navigation & Pathfinding Integration Contract

Indoor obstacle-aware navigation between points of interest will plug into the `INavigationServiceContract`:
```ts
export interface INavigationServiceContract {
  calculateRoute(request: PathfindingRequestDTO): Promise<NavigationPathDTO | null>;
  isPositionWalkable(position: Vector3D): Promise<boolean>;
}
```
* Coordinates remain in real-world metric units ($1\text{ unit} = 1\text{ meter}$).
* `NavigationController.calculateRoute` connects to `/api/navigation/route` once NavMesh extraction is completed.

---

## 10. Local Development Commands

### Development Runner
```bash
# Launch concurrent Frontend & Backend
./scripts/run_dev.sh
```

### Backend Commands
```bash
cd backend
npm install        # Install dependencies
npm run dev        # Hot-reloading development server on port 5001
npm run typecheck  # Strict TypeScript verification
npm run build      # Compile production bundle to dist/
npm start          # Execute compiled production service
```

### Frontend Commands
```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Launch Vite dev server on port 5173
npm run build      # Production build (tsc -b && vite build)
```
