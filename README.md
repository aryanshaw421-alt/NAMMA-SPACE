# Namma Space (ನಮ್ಮ Space)

> **An End-to-End Intelligent Spatial Engine Converting Ordinary Smartphone Captures into Interactive 3D Digital Twins**

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Three.js%20%7C%20Vite-cyan.svg)](frontend/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20TypeScript-green.svg)](backend/)
[![Reconstruction](https://img.shields.io/badge/reconstruction-Python%20%7C%20CV-orange.svg)](reconstruction/)

---

## 📌 Executive Summary & Objective

**Namma Space** is designed to democratize indoor spatial digitization. Rather than relying on expensive LiDAR rigs or industrial 3D scanners, Namma Space enables anyone with an everyday smartphone to capture an indoor environment and convert it into a navigable, metric-accurate **3D Digital Twin** accessible through any standard web browser without software installation.

---

## 🚀 End-to-End Long-Term Pipeline

```
Smartphone Capture
       │
       ▼
3D Reconstruction (CV / SfM / MVS)
       │
       ▼
3D Digital Twin (GLTF / GLB)
       │
       ▼
Interactive Web Viewer (WASD + Mouse Look)  <--- [CURRENT FOCUS: ROUND 1]
       │
       ▼
POI Tagging & Semantic Annotations          <--- [ROUND 2]
       │
       ▼
Spatial Search & Metric Proximity           <--- [ROUND 2]
       │
       ▼
Obstacle-Aware Pathfinding (NavMesh)        <--- [ROUND 2]
       │
       ▼
Optional AR Navigation & Wayfinding         <--- [FUTURE]
```

---

## 🎯 Current Status: Round 1 Implementation & Backend Foundation

| Component / Requirement | Status | Implementation Details |
|-------------------------|--------|------------------------|
| **1. Reliable Smartphone Capture SOP** | ✅ Complete | Documented in [`docs/sop/smartphone_capture_sop.md`](docs/sop/smartphone_capture_sop.md) with 3-tier scanning trajectory and AE/AF locking protocol. |
| **2. Indoor 3D Reconstruction Pipeline** | ⚙️ Architecture & Frame Extractor Ready | Setup in [`reconstruction/`](reconstruction/) with OpenCV Laplacian blur detection keyframe extractor. Ready for capture video ingestion. |
| **3. Zero-Install Web Viewer** | ✅ Complete | Built with React 19, TypeScript, Three.js, and Vite. Runs natively in any WebGL browser. |
| **4. Smooth First-Person Free Roaming** | ✅ Complete | Physics-based velocity damping, eye-height grounding, and boundary reference system. |
| **5. WASD Movement & Mouse Look** | ✅ Complete | Implemented with HTML5 PointerLock API and custom `useFirstPersonControls` hook. |
| **6. Modular Backend & Model Delivery** | ✅ Complete | 4-tier architecture (Routes → Controllers → Services → Data) with path traversal shields, MIME headers, and static GLB streaming. |
| **7. Spatial Integration Contracts** | ✅ Complete | Type-safe interfaces in `backend/src/contracts/spatialContracts.ts` for future POI, spatial search, and NavMesh navigation. |

---

## 📂 Repository Architecture

```
namma-space/
├── frontend/                     # React + TypeScript + Three.js + Vite Web Viewer
│   ├── src/
│   │   ├── components/
│   │   │   ├── Viewer/          # 3D Canvas, Controls Overlay, Model Selector
│   │   │   └── UI/              # Header, POI Modals, Telemetry Pills
│   │   ├── hooks/               # useFirstPersonControls, useModelLoader
│   │   ├── services/            # poiService, spatialIndex, pathfindingService
│   │   ├── styles/              # Dark aesthetic glassmorphic design system
│   │   └── types/               # TypeScript interfaces (Camera, ModelInfo, POI)
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js + TypeScript + Express Service (Port 5001)
│   ├── src/
│   │   ├── controllers/         # Health, Model, Search, Navigation controllers
│   │   ├── services/            # ModelService (cataloging, validation, security)
│   │   ├── middleware/          # Centralized error handler & AppError hierarchy
│   │   ├── contracts/           # Spatial integration contracts (POI, Search, Nav)
│   │   ├── types/               # Standard API response envelopes (ApiResponse)
│   │   ├── routes/              # Domain routers (health, models, pois, search, navigation)
│   │   └── index.ts             # Express server entry point & static /models mount
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── reconstruction/               # Python Computer Vision Pipeline
│   ├── utils/                   # Laplacian blur detector & quality assurance
│   ├── extract_frames.py        # Video keyframe extractor script
│   ├── main.py                  # CLI pipeline orchestrator
│   ├── requirements.txt         # CV dependencies (OpenCV, Trimesh, NumPy)
│   └── README.md
├── data/                         # Data storage hierarchy
│   ├── raw/                     # Raw smartphone walkthrough videos & photo sets
│   ├── processed/               # Reconstructed 3D models (.glb, .gltf, .obj)
│   ├── sample/                  # Sample test assets
│   └── pois.json                # Persisted spatial points of interest
├── docs/                         # Technical documentation & protocols
│   ├── architecture/            # System Architecture, Web Viewer, CV Pipeline
│   ├── backend_architecture.md  # Layered backend design, contracts, error handling
│   ├── backend_integration.md   # Model-serving pipeline & frontend-backend flow
│   ├── backend_integration_checklist.md # Production integration checklist
│   └── sop/                     # Smartphone Capture SOP
├── scripts/                      # Automation & runner scripts
│   ├── setup.sh                 # Single-command workspace dependency installer
│   └── run_dev.sh               # Concurrent frontend + backend dev launcher
├── README.md                     # Root project documentation
└── .gitignore                    # Git exclusions (Node, Python, large 3D binaries)
```

---

## 🕹️ Controls & Roaming Guide

When navigating the 3D Web Viewer:

| Key / Action | Function |
|--------------|----------|
| **Click Canvas** | Lock mouse cursor to activate first-person look |
| **W / S** | Walk Forward / Backward |
| **A / D** | Strafe Left / Right |
| **Mouse** | Look around (360° yaw, pitch clamped) |
| **Shift** | Sprint (2.2× movement speed) |
| **Space / E** | Elevate camera upward |
| **Q / Ctrl** | Descend camera downward |
| **Esc** | Release mouse cursor |
| **Load 3D Model** | Drag and drop any `.glb`, `.gltf`, or `.obj` file or choose from backend |
| **Reset Cam** | Return camera to default starting vantage point |

---

## 🌐 Backend Domain APIs & Endpoints

The backend is organized into 5 distinct architectural domains running on port `5001`:

| Endpoint | Method | Domain | Function |
|---|---|---|---|
| `/` | `GET` | System | API root discovery and route catalog |
| `/api/health` | `GET` | Health | Service status, uptime, environment, and timestamp |
| `/api/models` | `GET` | Models | Lists available 3D digital twins in `data/processed/` |
| `/api/models/:id` | `GET` | Models | Resolves metadata for a specific model (path-traversal protected) |
| `/api/models/:id/file` | `GET` | Models | Direct binary streaming with format-specific MIME headers |
| `/models/:filename` | `GET` | Static Stream | High-throughput static file streaming via `express.static` |
| `/api/pois` | `GET`, `POST`, `DELETE` | POIs | Spatial annotations and point-of-interest persistence |
| `/api/search` | `GET` | Spatial Search | Typed contract placeholder for Member 3 spatial indexing |
| `/api/navigation/route` | `POST` | Navigation | Typed contract placeholder for Member 3 NavMesh pathfinding |

All API responses conform to the standard typed envelope (`{ success: true, data: {}, error: null }`). For complete architectural details, see [`docs/backend_architecture.md`](docs/backend_architecture.md).

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v22+ recommended)
- **npm**: v9.0.0 or later
- **Python**: 3.10+ (for reconstruction pipeline)

### 1. Automated Setup
Run the setup script from the root directory to install all dependencies:
```bash
./scripts/setup.sh
```

### 2. Launch Development Servers
Launch both the backend API and frontend Vite dev server concurrently:
```bash
./scripts/run_dev.sh
```

Alternatively, run each service independently:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173 in your browser
```

**Backend:**
```bash
cd backend
npm install
npm run dev
# API runs on http://localhost:5001
```

---

## 📸 Smartphone Capture SOP Summary

For full details, see [`docs/sop/smartphone_capture_sop.md`](docs/sop/smartphone_capture_sop.md).

1. **Resolution**: 4K UHD at 30 fps or 60 fps.
2. **Exposure**: Lock AE/AF on screen before walking.
3. **Lighting**: Keep all indoor lights turned on; avoid moving shadows.
4. **Trajectory**: Follow the **3-Tier Scanning Pattern**:
   - *Outer Perimeter Loop* (tilted 15° down, closed loop).
   - *Interior Orbits* (360° around key furniture/pillars).
   - *Cross-Grid Walk* (tilted 20° up for ceiling/lighting details).
5. **Walking Speed**: Maintain 0.3 m/s to 0.5 m/s (slow heel-to-toe walk).

---

## 🛠️ Round 2 Roadmap (Prepared Architecture)

The system is built modularly with typed service contracts ready for Round 2:
1. **POI Annotation System** (`frontend/src/services/poiService.ts`):
   - Interactive 3D pin placement on digital twin surface geometry.
   - Metadata popups with room tags, equipment details, and descriptions.
2. **Spatial Search** (`frontend/src/services/spatialIndex.ts`):
   - Octree/BVH spatial partitioning for real-time proximity lookups.
   - Text search resolving to 3D spatial coordinates.
3. **Obstacle-Aware Pathfinding** (`frontend/src/services/pathfindingService.ts`):
   - NavMesh generation directly from floor mesh topology.
   - A* shortest-path corridor navigation between POIs.
