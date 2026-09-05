"""
Frame Quality & Blur Detector
Uses variance of Laplacian to filter out motion-blurred smartphone frames.
"""

import cv2
import numpy as np


def compute_blur_score(image: np.ndarray) -> float:
    """
    Computes the focus measure using the variance of the Laplacian.
    Higher values indicate sharper focus; lower values indicate motion blur.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def is_frame_sharp(image: np.ndarray, threshold: float = 100.0) -> bool:
    """Returns True if the frame is sufficiently sharp for photogrammetry feature matching."""
    return compute_blur_score(image) >= threshold
