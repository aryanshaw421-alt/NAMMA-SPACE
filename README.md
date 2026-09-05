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

## 🎯 Current Status: Round 1 Implementation

| Round 1 Requirement | Status | Implementation Details |
|---------------------|--------|------------------------|
| **1. Reliable Smartphone Capture SOP** | ✅ Complete | Documented in [`docs/sop/smartphone_capture_sop.md`](docs/sop/smartphone_capture_sop.md) with 3-tier scanning trajectory and AE/AF locking protocol. |
| **2. Indoor 3D Reconstruction Pipeline** | ⚙️ Architecture & Frame Extractor Ready | Setup in [`reconstruction/`](reconstruction/) with OpenCV Laplacian blur detection keyframe extractor. Ready for capture video ingestion. |
| **3. Zero-Install Web Viewer** | ✅ Complete | Built with React 19, TypeScript, Three.js, and Vite. Runs natively in any WebGL browser. |
| **4. Smooth First-Person Free Roaming** | ✅ Complete | Physics-based velocity damping, eye-height grounding, and boundary reference system. |
| **5. WASD Movement & Mouse Look** | ✅ Complete | Implemented with HTML5 PointerLock API and custom `useFirstPersonControls` hook. |

*Note: Per competition guidelines, POI tagging, spatial search, and AR navigation are strictly out of scope for Round 1 and planned for Round 2.*

---

## 📂 Repository Architecture

```
namma-space/
├── frontend/                     # React + TypeScript + Three.js + Vite Web Viewer
│   ├── src/
│   │   ├── components/
│   │   │   ├── Viewer/          # 3D Canvas, Controls Overlay, Model Selector
│   │   │   └── UI/              # Top navigation bar, telemetry pills
│   │   ├── hooks/               # useFirstPersonControls, useModelLoader
│   │   ├── services/            # Round 2 interface stubs (POI, search, pathfinding)
│   │   ├── styles/              # Dark aesthetic glassmorphic design system
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js + TypeScript + Express Service
│   ├── src/
│   │   ├── routes/              # Health and 3D models API
│   │   └── index.ts             # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── reconstruction/               # Python Computer Vision Pipeline
│   ├── utils/                   # Laplacian blur detector & quality assurance
│   ├── extract_frames.py        # Video keyframe extractor script
│   ├── main.py                  # CLI pipeline orchestrator
│   ├── requirements.txt         # CV dependencies (OpenCV, Trimesh, NumPy)
│   └── README.md
├── data/                         # Data storage hierarchy
│   ├── raw/                     # Raw smartphone walkthrough videos & photo sets
│   ├── processed/               # Reconstructed 3D models (.glb, .gltf, .obj)
│   └── sample/                  # Sample test assets
├── docs/                         # Technical documentation & protocols
│   ├── architecture/            # System Architecture, Web Viewer, CV Pipeline
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
