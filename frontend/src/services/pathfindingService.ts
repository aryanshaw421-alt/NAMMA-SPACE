/**
 * Obstacle-Aware Pathfinding Service Interface
 * Prepared for Round 2: NavMesh generation, A* search, and walkable corridor calculation.
 */

import * as THREE from 'three';
import type { NavigationPath } from '../types';

export interface IPathfindingService {
  generateNavMesh(mesh: THREE.Object3D): Promise<boolean>;
  findPath(start: THREE.Vector3, destination: THREE.Vector3): Promise<NavigationPath | null>;
  isWalkable(point: THREE.Vector3): boolean;
}

export class PathfindingService implements IPathfindingService {
  async generateNavMesh(_mesh: THREE.Object3D): Promise<boolean> {
    // Round 2 implementation: Recast / three-pathfinding NavMesh generation
    return false;
  }

  async findPath(_start: THREE.Vector3, _destination: THREE.Vector3): Promise<NavigationPath | null> {
    return null;
  }

  isWalkable(_point: THREE.Vector3): boolean {
    return true;
  }
}

export const pathfindingService = new PathfindingService();
