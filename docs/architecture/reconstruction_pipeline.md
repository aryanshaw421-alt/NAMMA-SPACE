# Namma Space - 3D Reconstruction Pipeline Architecture

**Document Version:** 1.0.0  
**Module:** `reconstruction/`  
**Technologies:** Python, OpenCV, COLMAP, Trimesh, Open3D

---

## 1. Overview

The reconstruction pipeline is responsible for ingesting smartphone video/photo collections and generating watertight, photorealistic, and low-latency 3D digital twins optimized for web streaming.

```
+-------------------------------------------------------------------------------+
|                            RECONSTRUCTION STAGES                              |
+-------------------------------------------------------------------------------+

  [Stage 1: Ingestion & Frame Decimation]
    • Input: High-resolution smartphone video (.mp4/.mov) from data/raw/
    • Keyframe extraction at 2.0 fps (ensures ~75% overlap between frames)
    • Laplacian variance filtering: discard frames with blur_score < threshold
    • Output: Ordered image sequence in data/raw/frames/
                 │
                 ▼
  [Stage 2: Structure-from-Motion (SfM)]
    • SIFT / SuperPoint feature extraction & descriptor computation
    • Exhaustive or Sequential feature matching with epipolar geometric verification
    • Incremental bundle adjustment (COLMAP)
    • Camera intrinsic calibration & 6-DoF extrinsic pose estimation
    • Output: Sparse point cloud (points3D.ply, cameras.txt, images.txt)
                 │
                 ▼
  [Stage 3: Multi-View Stereo (MVS) & Surface Reconstruction]
    • PatchMatch stereo depth map estimation & photometric filtering
    • Depth map fusion into dense point cloud
    • Screened Poisson Surface Reconstruction or Delaunay Tetrahedral meshing
    • Output: Raw high-density polygonal mesh (.ply / .obj)
                 │
                 ▼
  [Stage 4: Mesh Optimization & PBR Texturing]
    • Quadric Error Metric (QEM) polygon decimation
      - Budget: 100,000 to 250,000 triangles (web performance sweet spot)
    • Non-overlapping UV unwrap generation (xatlas)
    • High-resolution texture reprojection and diffuse atlas baking
    • Output: Optimized binary GLTF (.glb) placed into data/processed/
```

---

## 2. Technical Specifications & Budgets

| Parameter | Specification | Rationale |
|-----------|---------------|-----------|
| **Input Capture Resolution** | 4K UHD (3840×2160) | Retains fine structural architectural details |
| **Extraction Sampling Rate** | 2.0 fps (0.5s intervals) | Balances redundancy with processing time |
| **Blur Score Cutoff** | $\text{Var}(\nabla^2 I) \ge 80.0$ | Discards frames corrupted by camera motion |
| **Target Polygon Budget** | 100k - 250k Triangles | Maintains steady 60 fps on desktop & mobile WebGL |
| **Texture Atlas** | Single 2048×2048 or 4096×4096 WebP/PNG | Minimizes WebGL draw calls and GPU memory footprint |
| **Target GLB File Size** | 15 MB - 45 MB | Enables fast zero-install web loading over broadband |

---

## 3. Automation Scripts

1. **`extract_frames.py`**:
   Extracts keyframes from video and eliminates motion blur using OpenCV Laplacian filtering.
   ```bash
   python3 reconstruction/extract_frames.py --video ../data/raw/room.mp4 --fps 2.0 --blur-threshold 80.0
   ```

2. **`main.py`**:
   Pipeline runner coordinating frame extraction, SfM execution, and export steps.
   ```bash
   python3 reconstruction/main.py --help
   ```
