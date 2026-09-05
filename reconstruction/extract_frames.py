#!/usr/bin/env python3
"""
Video Keyframe Extraction Script
Extracts high-overlap, sharp frames from smartphone video walkthroughs for photogrammetry.
"""

import os
import sys
import argparse
from pathlib import Path

try:
    import cv2
    from utils.blur_detector import compute_blur_score
except ImportError:
    print("Warning: opencv-python not installed in current Python environment.")
    print("Run: pip install -r requirements.txt")


def extract_frames(video_path: str, output_dir: str, fps: float = 2.0, blur_threshold: float = 80.0):
    """
    Extracts frames from a video at target fps and filters out blurry frames.
    """
    path = Path(video_path)
    if not path.exists():
        print(f"Error: Video file '{video_path}' does not exist.")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(str(path))

    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        sys.exit(1)

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = total_frames / video_fps if video_fps > 0 else 0
    step = int(video_fps / fps) if video_fps > 0 and fps > 0 else 1
    if step < 1:
        step = 1

    print(f"Processing: {video_path}")
    print(f"Video FPS: {video_fps:.2f} | Total Frames: {total_frames} | Duration: {duration_sec:.1f}s")
    print(f"Sampling every {step} frames (~{fps} fps) with blur threshold {blur_threshold}...")

    saved_count = 0
    skipped_blur = 0
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % step == 0:
            blur_score = compute_blur_score(frame)
            if blur_score < blur_threshold:
                skipped_blur += 1
            else:
                out_name = f"frame_{saved_count:05d}.jpg"
                out_path = os.path.join(output_dir, out_name)
                cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
                saved_count += 1

        frame_idx += 1

    cap.release()
    print(f"\nExtraction complete:")
    print(f"- Extracted & Saved: {saved_count} sharp frames to {output_dir}")
    print(f"- Discarded blurry frames: {skipped_blur}")


def main():
    parser = argparse.ArgumentParser(description="Extract sharp keyframes from smartphone video")
    parser.add_argument("--video", type=str, required=True, help="Path to input video (.mp4, .mov)")
    parser.add_argument("--output", type=str, default="../data/raw/frames", help="Output directory for extracted frames")
    parser.add_argument("--fps", type=float, default=2.0, help="Target extraction frame rate (default: 2.0 fps)")
    parser.add_argument("--blur-threshold", type=float, default=80.0, help="Laplacian variance threshold for blur")

    args = parser.parse_args()
    extract_frames(args.video, args.output, args.fps, args.blur_threshold)


if __name__ == "__main__":
    main()
