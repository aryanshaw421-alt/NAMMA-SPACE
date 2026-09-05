# Namma Space - 3D Web Viewer Architecture

**Document Version:** 1.0.0  
**Module:** `frontend/`  
**Technologies:** React 19, TypeScript, Three.js, Vite

---

## 1. Overview

The Namma Space Web Viewer delivers a **zero-install, high-performance browser interface** for first-person exploration of indoor 3D digital twins. It runs natively across modern browsers via WebGL, requiring no plugins, specialized runtime software, or downloads.

---

## 2. Rendering Pipeline & Three.js Stack

```
+-------------------------------------------------------------+
|                     THREE.JS RENDER LOOP                    |
+-------------------------------------------------------------+
   Three.Scene (0x0a0c10 background, subtle atmospheric fog)
     │
     ├── PerspectiveCamera (FOV: 65°, Near: 0.1, Far: 1000)
     │     └── Driven by useFirstPersonControls hook
     │
     ├── Illumination
     │     ├── AmbientLight (0xffffff, 0.85 intensity)
     │     ├── DirectionalLight (Shadow-mapped key sun light)
     │     └── HemisphereLight (Sky/ground color contrast)
     │
     ├── Spatial Context
     │     ├── GridHelper (60m × 60m cyan metric grid, 1m intervals)
     │     ├── Infinite base floor (PBR matte receiver)
     │     └── Optional Architectural Reference Bounds
     │
     └── Digital Twin Mesh Container (THREE.Group)
           └── Automatically centered and placed at ground level (Y=0)
```

---

## 3. First-Person Controls & Roaming Physics

The viewer implements a customized first-person camera system via `frontend/src/hooks/useFirstPersonControls.ts`:

### 3.1 Input Mapping
| Key / Input | Action | Technical Mechanism |
|-------------|--------|---------------------|
| **W / Up Arrow** | Move Forward | Adds scaled vector along horizontal camera forward vector |
| **S / Down Arrow** | Move Backward | Adds negative vector along horizontal camera forward vector |
| **A / Left Arrow** | Strafe Left | Adds negative vector along camera right vector |
| **D / Right Arrow** | Strafe Right | Adds scaled vector along camera right vector |
| **Shift** | Sprint (2.2×) | Multiplies base movement velocity |
| **Space / E** | Elevate Up | Adds vertical velocity |
| **Q / Ctrl** | Descend Down | Decreases vertical velocity |
| **Mouse Move** | Look Around | Rotates camera Euler angles (Pitch clamped between -85° and +85°) |
| **Esc** | Exit PointerLock | Releases cursor lock |

### 3.2 Smooth Motion Damping
Rather than instantaneous step movements, velocity decays exponentially:
$$\mathbf{v}_{t+1} = \mathbf{v}_t - \mathbf{v}_t \cdot 10.0 \cdot \Delta t$$
This produces a fluid, natural walking sensation without stuttering or abrupt stops.

### 3.3 Metric Coordinate Telemetry
The real-time camera position $(X, Y, Z)$ in meters is fed into the HUD telemetry overlay at 60 fps, providing precise spatial context.

---

## 4. Model Ingestion System

The `useModelLoader` hook dynamically loads 3D models via:
1. **Local File Ingestion**: Users or judges can drag and drop any `.glb`, `.gltf`, or `.obj` file directly into the browser without uploading to a server.
2. **Backend Model Streaming**: Reconstructed twins placed in `data/processed/` are automatically served via the backend Express API at `http://localhost:5001/api/models`.
3. **Automatic Normalization**: Upon loading, the system computes the model's bounding box, centers it at $(0, 0, 0)$, grounds the floor to $Y=0$, and teleports the camera to an optimal starting vantage point.

---

## 5. Round 2 Extensibility Hooks

The viewer is designed to easily accommodate Round 2 features:
- **POI Pinning**: Raycaster can intercept clicks on model meshes to trigger `poiService.addPOI`.
- **Navigation Overlay**: The Three.js scene can render a tube or dashed spline for `NavigationPath` returned by `pathfindingService`.
- **Spatial Search**: Results from `spatialIndexService` can trigger camera interpolation (`teleport`) to specific POI coordinates.
