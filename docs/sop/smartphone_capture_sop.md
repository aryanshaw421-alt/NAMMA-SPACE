# Namma Space - Smartphone Indoor Capture Standard Operating Procedure (SOP)

**Document Version:** 1.0.0  
**Phase:** Round 1 - Spatial Capture & Digital Twin Reconstruction  
**Target Environment:** Indoor Spaces (Offices, Labs, Classrooms, Retail, Residential)

---

## 1. Objective

To establish a standardized, repeatable protocol for capturing high-fidelity visual data of indoor environments using consumer smartphones. Following this SOP ensures optimal Structure-from-Motion (SfM) feature correspondence, prevents tracking loss, and produces high-density 3D digital twins.

---

## 2. Equipment & Device Preparation

### 2.1 Supported Hardware
- Any standard smartphone equipped with a primary wide-angle camera (24mm–28mm equivalent).
- Gimbal or two-handed grip (recommended for physical stability).

### 2.2 Camera Settings Configuration
Before beginning any capture:
1. **Resolution & Frame Rate**:
   - Video Mode: **4K (3840×2160) at 30 fps or 60 fps**.
   - Photo Mode (if taking stills): Highest native resolution (12MP–48MP), 4:3 or 16:9 aspect ratio.
2. **Lock Focus & Exposure (AE/AF Lock)**:
   - *Crucial Rule:* Tap and hold the screen to lock exposure and white balance at an average indoor illumination level.
   - *Why:* Auto-exposure shifts between frames invalidate photometric consistency and cause reconstruction artifacts.
3. **Turn Off Digital Zoom**:
   - Use only 1x optical lens. Never use digital zoom (causes pixel interpolation and loss of geometric rigor).
4. **Turn Off Flash / Torch**:
   - Moving point light sources create moving shadows, breaking the Lambertian surface assumption required for photogrammetry.
5. **Clean the Camera Lens**:
   - Wipe with a microfiber cloth to prevent lens flare and diffraction halos.

---

## 3. Environment Preparation

1. **Illumination**:
   - Turn on all overhead indoor lights to provide uniform, diffuse illumination.
   - Close blinds or curtains if direct sunlight creates high-contrast streaks or moving shadows.
2. **Stationary Geometry**:
   - Ensure no people or pets walk through the scene during capture.
   - Keep all interior doors open and secure them so they do not swing.
3. **Challenging Surfaces**:
   - **Mirrors & Glass**: Cover large mirrors or place temporary low-tack painter's tape / post-it markers on featureless glass panels.
   - **Textureless White Walls**: Use visual anchors (posters, sticky notes, or temporary high-contrast markers) if a wall is completely devoid of texture.

---

## 4. Capture Trajectory & Flight Path

To ensure the **70%–80% spatial overlap** necessary for robust feature matching, follow the 3-Tier Scanning Pattern:

```
┌────────────────────────────────────────────────────────┐
│ [Loop 1: Perimeter Scan - Camera angled 15° down]     │
│   ┌────────────────────────────────────────────────┐   │
│   │ [Loop 2: Interior Orbit - Center fixtures]     │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │ [Loop 3: Cross-Grid Walk - Eye Level]  │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 4.1 Tier 1: Outer Perimeter Loop
- Walk smoothly along the room perimeter, maintaining a distance of 1.5m – 2.0m from the walls.
- Hold the smartphone horizontally (landscape), tilted slightly downwards (~10°–15°) so that the wall-floor junction is continuously visible.
- Walk in a complete closed loop returning to the exact starting point. Closing the loop enables global bundle adjustment to eliminate drift.

### 4.2 Tier 2: Feature & Object Orbits
- For freestanding tables, pillars, reception desks, or furniture clusters, perform an orbit walk (360° circular trajectory) around each object at two distinct heights:
  - Chest level (~1.4m)
  - Eye level (~1.7m)

### 4.3 Tier 3: Ceiling & Floor Junction Cross-Grid
- Walk an "S-curve" or "lawnmower" pattern across the center of the room.
- Tilt the camera slightly upward (~20°) to capture ceiling edges, HVAC, lighting fixtures, and high wall features.

---

## 5. Movement Velocity & Operator Technique

- **Walking Speed**: Maintain a steady, deliberate pace of **0.3 m/s to 0.5 m/s** (approx. 1 foot per second).
- **Smooth Turns**: Never pivot on your heel abruptly. Curve your trajectory smoothly. Fast rotations induce severe motion blur and rolling shutter skew.
- **Two-Handed Stance**: Tuck your elbows against your torso to act as a natural human stabilizer.
- **Footwork**: Use the "ninja walk" (heel-to-toe rolling step) to minimize vertical oscillation.

---

## 6. Post-Capture Verification Checklist

Before leaving the capture site, verify:
- [ ] Entire loop duration: typically 2 to 4 minutes for a standard 50m² room.
- [ ] No dropped frames, jerky pans, or rapid turns.
- [ ] File copied to `data/raw/` with descriptive naming:
  `data/raw/YYYYMMDD_LocationName_Walkthrough01.mp4`
- [ ] Run blur detection tool:
  ```bash
  python3 reconstruction/extract_frames.py --video ../data/raw/YYYYMMDD_LocationName_Walkthrough01.mp4 --fps 2.0
  ```
- [ ] Verify that at least 250–500 sharp frames are generated without severe blur warnings.
