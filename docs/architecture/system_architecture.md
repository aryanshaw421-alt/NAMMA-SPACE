# Namma Space - System Architecture

**Document Version:** 1.0.0  
**Phase:** Round 1 (Foundation & First-Person Viewer) with Modular Path to Round 2

---

## 1. Architectural Vision

Namma Space is an end-to-end intelligent spatial engine that transforms standard smartphone video/photo captures of indoor spaces into interactive 3D digital twins. It provides browser-based, zero-install exploration with smooth first-person controls, paving the way for indoor navigation, spatial search, and point-of-interest (POI) management.

```
+-------------------------------------------------------------------------------+
|                                NAMMA SPACE                                   |
|                        End-to-End System Pipeline                             |
+-------------------------------------------------------------------------------+

 [1. SMARTPHONE CAPTURE]
   • 4K Video / High-Res Photos (SOP Compliant)
   • Locked AE/AF, 70-80% spatial overlap
                     │
                     ▼
 [2. RECONSTRUCTION PIPELINE (Python / CV)]
   • Frame Extraction & Laplacian Blur Filtering
   • Structure-from-Motion (COLMAP / SIFT) -> Camera Poses & Sparse Cloud
   • Surface Reconstruction (MVS / Poisson / Gaussian Splatting)
   • Mesh Decimation & PBR Texture Baking
   • Artifact: Optimized GLTF / GLB in data/processed/
                     │
                     ▼
 [3. BACKEND SERVICE (Node.js / Express / TypeScript)]
   • RESTful Spatial Endpoints (/api/health, /api/models)
   • Static 3D Asset Streaming & Range Requests
   • Round 2 Extension: Spatial DB & POI Persistence
                     │
                     ▼
 [4. ZERO-INSTALL 3D WEB VIEWER (React / Three.js / Vite)]
   • Real-Time WebGL Rendering (PBR, Tone Mapping, Shadows)
   • First-Person WASD + Mouse Look Camera System (PointerLock)
   • Spatial HUD Telemetry & Bounding Reference System
   • Direct Local/Remote GLB/GLTF/OBJ Loader
                     │
                     ▼
 [ROUND 2 MODULAR HOOKS (Prepared Stubs)]
   • POI Annotation Layer (poiService.ts)
   • Spatial Query & Octree Search (spatialIndex.ts)
   • Obstacle-Aware NavMesh Pathfinding (pathfindingService.ts)
```

---

## 1.1 Core Delivery Architecture & Data Flow

```
User Browser
    ↓
React + Three.js
    ↓
Backend API
    ↓
Model Service
    ↓
data/processed/
    ↓
GLB/GLTF
    ↓
Three.js Viewer
```

### Layer Responsibilities

1. **User Browser**:
   - Host environment providing standard WebGL 2.0 runtime, HTML5 PointerLock API, and user input capture (keyboard/mouse).
   - Zero-install entry point requiring no external plugins or standalone desktop applications.

2. **React + Three.js (Frontend Layer)**:
   - Orchestrates UI state, HUD telemetry, modals (ModelSelector), and canvas lifecycle.
   - Manages rendering context, lighting, camera transforms, animation tick loop, and first-person free-roam controls (`useFirstPersonControls`).

3. **Backend API (Express / Node.js)**:
   - High-throughput REST API listening on port 5001.
   - Handles health checks (`/api/health`), route dispatching, and system metadata.
   - Enforces global Cross-Origin Resource Sharing (CORS) headers for seamless decoupled frontend-backend communication.

4. **Model Service (Catalog & Static Dispatcher)**:
   - Discovers, filters, and catalogs reconstructed 3D assets (`.glb`, `.gltf`, `.obj`, `.ply`) via `/api/models`.
   - Serves binary assets over HTTP via `express.static` with correct MIME types (`model/gltf-binary`, `model/gltf+json`).

5. **`data/processed/` (Artifact Storage)**:
   - Dedicated filesystem directory housing production-ready 3D digital twin models produced by the Python CV reconstruction pipeline.
   - Serves as the boundary contract between offline photogrammetry/NeRF reconstruction and online web streaming.

6. **GLB/GLTF (3D Transmission Asset)**:
   - Standardized, web-optimized binary 3D container format packaging geometry (vertices, normals), PBR material properties, and embedded textures into an efficient single stream.

7. **Three.js Viewer (Scene Integration & Display)**:
   - Ingests streamed GLB buffers via `GLTFLoader`, computes spatial bounding boxes, normalizes model coordinates, centers the twin at ground level ($Y=0$), and binds it into the active scene graph for first-person exploration.

---

## 2. Component Specifications

### 2.1 3D Reconstruction Pipeline (`reconstruction/`)
- **Language**: Python 3.10+
- **Core Libraries**: OpenCV, NumPy, Trimesh, SciPy
- **Reconstruction Engine**: COLMAP for Structure-from-Motion; optional Open3D/Nerfstudio
- **Outputs**:
  - Web-ready `.glb` files with decimated polygon budgets (<250k triangles) for 60 fps web rendering.
  - Compressed PBR textures (1K-4K resolution).

### 2.2 Backend Service (`backend/`)
- **Runtime**: Node.js (ES Modules, TypeScript)
- **Framework**: Express.js
- **Key Responsibilities**:
  - Model catalog API (`/api/models`) serving verified digital twin assets from `data/processed/`.
  - Static file streaming optimized for 3D binary blobs (`.glb`).
  - Modular structure (`src/routes`, `src/services`) allowing Round 2 database integration (e.g. SQLite/PostgreSQL for POI records).

### 2.3 Frontend 3D Viewer (`frontend/`)
- **Framework**: React 19 + TypeScript + Vite
- **3D Engine**: Three.js
- **Controls**: Custom `useFirstPersonControls` hook leveraging browser `PointerLock` API:
  - WASD / Arrow Keys for directional walk and strafe.
  - Shift key for sprint multiplier.
  - Mouse look with pitch clamping to prevent gimbal flips.
  - Space / Q / E for vertical exploration.
- **Visual Design**: Sleek dark aesthetic with cyan glowing accents, glassmorphic HUD telemetry, and coordinate readouts.

---

## 3. Data Flow & Contracts

| Directory | Purpose | File Formats |
|-----------|---------|--------------|
| `data/raw/` | Raw smartphone video walkthroughs and photo collections | `.mp4`, `.mov`, `.jpg`, `.dng` |
| `data/processed/` | Post-reconstruction digital twin assets | `.glb`, `.gltf`, `.obj`, `.ply` |
| `data/sample/` | Lightweight test models for local CI/CD & viewer testing | `.glb` |

---

## 4. Round 2 Extensibility Guarantee

To ensure Round 2 features (POI tagging, spatial search, and obstacle-aware pathfinding) integrate cleanly without rewriting Round 1 code:
1. **Modular Services**: Typed service contracts (`IPOIService`, `ISpatialIndexService`, `IPathfindingService`) are defined in `frontend/src/services/`.
2. **Coordinate Synchronization**: All camera and model telemetry uses real-world metric units (1 Three.js unit = 1 meter).
3. **Collision / Bounds Isolation**: Model bounding boxes and floor clamps are modularly tracked in `useModelLoader` and `ViewerCanvas`.
