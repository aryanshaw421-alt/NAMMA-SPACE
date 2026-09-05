#!/usr/bin/env python3
"""
Namma Space 3D Reconstruction Pipeline Runner
Provides a unified CLI interface for:
- Frame extraction
- Feature extraction & Structure from Motion (SfM)
- Dense reconstruction & Mesh texturing
- GLTF/GLB export for Web Viewer consumption
"""

import sys
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Namma Space 3D Reconstruction Pipeline CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available pipeline stages")

    # Frame extraction command
    extract_parser = subparsers.add_parser("extract-frames", help="Extract sharp frames from video")
    extract_parser.add_argument("--video", required=True, help="Input video file path")
    extract_parser.add_argument("--output", default="../data/raw/frames", help="Destination directory for frames")
    extract_parser.add_argument("--fps", type=float, default=2.0, help="Frames per second to sample")

    # SfM command
    sfm_parser = subparsers.add_parser("sfm", help="Run Structure-from-Motion (COLMAP)")
    sfm_parser.add_argument("--image-dir", required=True, help="Path to input images directory")
    sfm_parser.add_argument("--output-dir", default="../data/processed/sfm", help="Path to SfM outputs")

    # Mesh & Export command
    export_parser = subparsers.add_parser("export-glb", help="Decimate and export mesh to web-ready GLB")
    export_parser.add_argument("--input-mesh", required=True, help="Input OBJ / PLY file")
    export_parser.add_argument("--output-glb", required=True, help="Output GLB path in data/processed/")
    export_parser.add_argument("--target-faces", type=int, default=100000, help="Target face count for web optimization")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "extract-frames":
        from extract_frames import extract_frames
        extract_frames(args.video, args.output, args.fps)
    elif args.command == "sfm":
        print(f"[COLMAP SfM] Running feature extraction on: {args.image_dir}")
        print("Note: Requires COLMAP installed on system. See docs/architecture/reconstruction_pipeline.md")
    elif args.command == "export-glb":
        print(f"[Export GLB] Converting {args.input_mesh} -> {args.output_glb}")
        print(f"Target polygon budget: {args.target_faces} faces")


if __name__ == "__main__":
    main()
