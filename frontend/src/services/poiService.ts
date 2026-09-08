/**
 * Point of Interest (POI) Service
 * Manages spatial annotations, 3D beacons, category tags, and persistence.
 */

import type { PointOfInterest } from '../types';

const API_BASE_URL = 'http://localhost:5001/api/pois';

const DEFAULT_POIS: PointOfInterest[] = [
  {
    id: 'poi-1',
    title: 'Robotics & Perception Testbench',
    category: 'Laboratory',
    position: { x: -4.2, y: 1.2, z: -3.5 },
    description: 'High-precision test area equipped with ROS2 workstations, motion capture cameras, and mobile manipulator test track.',
    tags: ['robotics', 'ros2', 'perception', 'cameras'],
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'poi-2',
    title: 'HPC GPU Compute Cluster (DGX)',
    category: 'Equipment',
    position: { x: 5.1, y: 1.4, z: -4.8 },
    description: 'Dedicated server rack hosting multi-GPU acceleration nodes for real-time 3D photogrammetry, NeRF training, and point-cloud decimation.',
    tags: ['gpu', 'server', 'compute', 'hpc', 'cluster'],
    createdAt: '2026-08-20T10:05:00.000Z'
  },
  {
    id: 'poi-3',
    title: 'Emergency Exit & Evacuation Assembly',
    category: 'Safety',
    position: { x: -7.5, y: 1.5, z: 6.2 },
    description: 'Primary fire-rated emergency exit route leading directly to the external campus quadrangle.',
    tags: ['exit', 'safety', 'evacuation', 'emergency'],
    createdAt: '2026-08-20T10:10:00.000Z'
  },
  {
    id: 'poi-4',
    title: 'CO2 Fire Suppression & First Aid Station',
    category: 'Safety',
    position: { x: 2.8, y: 1.3, z: 5.4 },
    description: 'Type B/C electrical fire extinguisher, automated AED kit, and industrial burn treatment kit.',
    tags: ['fire', 'extinguisher', 'safety', 'first-aid', 'aed'],
    createdAt: '2026-08-20T10:15:00.000Z'
  },
  {
    id: 'poi-5',
    title: 'Rapid Prototyping & 3D Fabrication Cell',
    category: 'Laboratory',
    position: { x: -3.0, y: 1.1, z: 4.1 },
    description: 'Stereolithography (SLA) resin printers, dual-extrusion FDM printers, and PCB soldering rework stations.',
    tags: ['3d-printing', 'fabrication', 'soldering', 'hardware'],
    createdAt: '2026-08-20T10:20:00.000Z'
  },
  {
    id: 'poi-6',
    title: 'Collaborative Brainstorming Amphitheater',
    category: 'Classroom',
    position: { x: 3.6, y: 1.2, z: 0.5 },
    description: 'Modular tiered discussion zone with multi-touch interactive displays for system architecture reviews.',
    tags: ['discussion', 'presentation', 'meeting', 'collaborative'],
    createdAt: '2026-08-20T10:25:00.000Z'
  }
];

export interface IPOIService {
  getPOIs(): Promise<PointOfInterest[]>;
  addPOI(poi: Omit<PointOfInterest, 'id' | 'createdAt'>): Promise<PointOfInterest>;
  removePOI(id: string): Promise<boolean>;
  getPOIById(id: string): Promise<PointOfInterest | null>;
}

export class POIService implements IPOIService {
  private cachedPOIs: PointOfInterest[] = [];
  private hasInitialized = false;

  async getPOIs(): Promise<PointOfInterest[]> {
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.pois) && data.pois.length > 0) {
          this.cachedPOIs = data.pois;
          this.hasInitialized = true;
          return this.cachedPOIs;
        }
      }
    } catch (e) {
      console.warn('Backend POI API unavailable, falling back to local storage / memory:', e);
    }

    if (!this.hasInitialized) {
      const stored = localStorage.getItem('namma_space_pois');
      if (stored) {
        try {
          this.cachedPOIs = JSON.parse(stored);
        } catch {
          this.cachedPOIs = [...DEFAULT_POIS];
        }
      } else {
        this.cachedPOIs = [...DEFAULT_POIS];
      }
      this.hasInitialized = true;
    }

    return this.cachedPOIs;
  }

  async addPOI(poiData: Omit<PointOfInterest, 'id' | 'createdAt'>): Promise<PointOfInterest> {
    const newPoi: PointOfInterest = {
      ...poiData,
      id: `poi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poiData),
      });
      if (res.ok) {
        const created = await res.json();
        this.cachedPOIs.push(created);
        this.persistLocal();
        return created;
      }
    } catch (e) {
      console.warn('Backend POI POST failed, persisting locally:', e);
    }

    this.cachedPOIs.push(newPoi);
    this.persistLocal();
    return newPoi;
  }

  async removePOI(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.cachedPOIs = this.cachedPOIs.filter((p) => p.id !== id);
        this.persistLocal();
        return true;
      }
    } catch (e) {
      console.warn('Backend POI DELETE failed, updating locally:', e);
    }

    this.cachedPOIs = this.cachedPOIs.filter((p) => p.id !== id);
    this.persistLocal();
    return true;
  }

  async getPOIById(id: string): Promise<PointOfInterest | null> {
    const list = await this.getPOIs();
    return list.find((p) => p.id === id) || null;
  }

  private persistLocal(): void {
    try {
      localStorage.setItem('namma_space_pois', JSON.stringify(this.cachedPOIs));
    } catch (e) {
      console.error('Failed to cache POIs to localStorage:', e);
    }
  }
}

export const poiService = new POIService();
