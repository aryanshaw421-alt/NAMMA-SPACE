# Namma Space - 3D Reconstruction Pipeline

This module converts smartphone captures (videos or overlapping photo sets) into web-optimized 3D digital twins (GLTF/GLB).

## Pipeline Overview

```
Smartphone Video / Photos (data/raw/)
          │
          ▼
1. Frame Extraction & Quality Filter (extract_frames.py)
   - Laplacian variance blur detection
   - 2-3 fps keyframe decimation (~70-80% spatial overlap)
          │
          ▼
2. Structure-from-Motion (SfM)
   - Feature detection (SIFT/SuperPoint)
   - Feature matching & geometric verification
   - Camera pose estimation & sparse point cloud
          │
          ▼
3. Multi-View Stereo (MVS) / Surface Reconstruction
   - Depth map estimation & fusion
   - Screened Poisson surface reconstruction or Neural Radiance Field / Gaussian Splatting
          │
          ▼
4. Mesh Optimization & GLTF Export
   - Quadric error decimation (budget: 100k-250k faces for 60fps web performance)
   - Texture baking (4K PBR atlas / WebP compression)
   - Export to `data/processed/*.glb`
```

## Setup & Prerequisites

1. **Python Environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **System Dependencies**:
   - **COLMAP** (for traditional SfM & MVS):
     - macOS: `brew install colmap`
     - Ubuntu/Debian: `sudo apt-get install colmap`
   - **FFmpeg** (optional for video stream extraction):
     - macOS: `brew install ffmpeg`

## Usage

### 1. Extract Sharp Keyframes from Video Walkthrough
```bash
python3 extract_frames.py --video ../data/raw/room_walkthrough.mp4 --output ../data/raw/frames --fps 2.0 --blur-threshold 80.0
```

### 2. Run Structure-from-Motion (COLMAP CLI)
Once keyframes are extracted into `../data/raw/frames`:
```bash
# A. Feature extraction
colmap feature_extractor \
   --database_path colmap.db \
   --image_path ../data/raw/frames \
   --ImageReader.camera_model OPENCV

# B. Feature matching
colmap exhaustive_matcher \
   --database_path colmap.db

# C. Sparse reconstruction (Structure-from-Motion)
mkdir -p sparse
colmap mapper \
   --database_path colmap.db \
   --image_path ../data/raw/frames \
   --output_path sparse/

# D. Export to PLY
colmap model_converter \
   --input_path sparse/0 \
   --output_path ../data/processed/sparse_cloud.ply \
   --output_type PLY
```

### 3. Pipeline Execution Status
> [!IMPORTANT]
> **Status as of Day 1:** The pipeline architecture, keyframe extraction script with Laplacian blur filtering, and output data paths are fully implemented. Actual 3D photogrammetry reconstruction has **NOT** been performed yet because the physical smartphone capture has not been conducted. Reconstruction will be executed once physical capture footage is recorded and deposited in `data/raw/`.

