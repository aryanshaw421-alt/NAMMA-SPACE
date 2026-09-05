import * as THREE from 'three';

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraRotation {
  pitch: number;
  yaw: number;
}

export interface ViewerSettings {
  moveSpeed: number;
  sprintMultiplier: number;
  mouseSensitivity: number;
  fov: number;
  showGrid: boolean;
  showAxes: boolean;
  eyeHeight: number;
}

export interface LoadedModelInfo {
  name: string;
  format: 'glb' | 'gltf' | 'obj';
  vertexCount: number;
  triangleCount: number;
  boundingBox: {
    size: { x: number; y: number; z: number };
    center: { x: number; y: number; z: number };
  };
}

export interface RemoteModelItem {
  id: string;
  name: string;
  format: string;
  path: string;
}

// ==========================================
// Round 2 Modular Architecture Placeholders
// (Prepared for seamless Round 2 implementation)
// ==========================================

export interface PointOfInterest {
  id: string;
  title: string;
  category: string;
  position: { x: number; y: number; z: number };
  normal?: { x: number; y: number; z: number };
  description?: string;
  tags?: string[];
  createdAt?: string;
}

export interface SpatialSearchResult {
  item: PointOfInterest;
  distance: number;
  score: number;
}

export interface NavigationPath {
  points: THREE.Vector3[];
  totalDistance: number;
  estimatedTimeSec: number;
}
