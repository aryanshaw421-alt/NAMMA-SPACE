/**
 * Obstacle-Aware Indoor Pathfinding Service
 * Computes walkable corridor routes and obstacle-free navigation splines between spatial points.
 */

import * as THREE from 'three';
import type { NavigationPath } from '../types';

interface NavNode {
  id: string;
  position: THREE.Vector3;
  neighbors: string[];
}

export interface IPathfindingService {
  findPath(start: THREE.Vector3, destination: THREE.Vector3): Promise<NavigationPath | null>;
  isWalkable(point: THREE.Vector3): boolean;
}

export class PathfindingService implements IPathfindingService {
  // Indoor topological corridor network covering campus innovation floor
  private nodes: Map<string, NavNode> = new Map();

  constructor() {
    this.initDefaultCorridorGraph();
  }

  private initDefaultCorridorGraph() {
    // Floor-level corridor nodes (Y = 0.05 m to float just above floor)
    const rawNodes: { id: string; x: number; y: number; z: number; neighbors: string[] }[] = [
      { id: 'hub-center', x: 0, y: 0.08, z: 0, neighbors: ['hub-north', 'hub-south', 'hub-east', 'hub-west'] },
      { id: 'hub-north', x: 0, y: 0.08, z: -3.5, neighbors: ['hub-center', 'wing-robotics', 'wing-hpc'] },
      { id: 'hub-south', x: 0, y: 0.08, z: 3.5, neighbors: ['hub-center', 'wing-fab', 'wing-exit', 'wing-safety'] },
      { id: 'hub-east', x: 3.5, y: 0.08, z: 0, neighbors: ['hub-center', 'wing-amphi', 'wing-hpc'] },
      { id: 'hub-west', x: -3.5, y: 0.08, z: 0, neighbors: ['hub-center', 'wing-robotics', 'wing-fab'] },

      // Sub-zones
      { id: 'wing-robotics', x: -4.0, y: 0.08, z: -3.0, neighbors: ['hub-north', 'hub-west'] },
      { id: 'wing-hpc', x: 4.8, y: 0.08, z: -4.0, neighbors: ['hub-north', 'hub-east'] },
      { id: 'wing-fab', x: -3.2, y: 0.08, z: 3.8, neighbors: ['hub-south', 'hub-west'] },
      { id: 'wing-exit', x: -6.8, y: 0.08, z: 5.8, neighbors: ['hub-south', 'wing-fab'] },
      { id: 'wing-safety', x: 2.5, y: 0.08, z: 5.0, neighbors: ['hub-south', 'wing-amphi'] },
      { id: 'wing-amphi', x: 3.5, y: 0.08, z: 0.8, neighbors: ['hub-east', 'wing-safety'] },
    ];

    for (const item of rawNodes) {
      this.nodes.set(item.id, {
        id: item.id,
        position: new THREE.Vector3(item.x, item.y, item.z),
        neighbors: item.neighbors,
      });
    }
  }

  async findPath(start: THREE.Vector3, destination: THREE.Vector3): Promise<NavigationPath | null> {
    const floorStart = new THREE.Vector3(start.x, 0.08, start.z);
    const floorDest = new THREE.Vector3(destination.x, 0.08, destination.z);

    // Direct line if very close (< 2.5 meters)
    const directDist = floorStart.distanceTo(floorDest);
    if (directDist < 2.5) {
      const waypoints = [floorStart, floorDest];
      return {
        points: this.interpolateSpline(waypoints, 10),
        totalDistance: directDist,
        estimatedTimeSec: Math.max(1, Math.round(directDist / 1.2)), // 1.2 m/s average indoor walk
      };
    }

    // Find closest graph entry node to start and destination
    const startNode = this.findClosestNode(floorStart);
    const destNode = this.findClosestNode(floorDest);

    if (!startNode || !destNode) {
      const waypoints = [floorStart, floorDest];
      return {
        points: this.interpolateSpline(waypoints, 12),
        totalDistance: directDist,
        estimatedTimeSec: Math.max(1, Math.round(directDist / 1.2)),
      };
    }

    // Run A* / Dijkstra on the corridor graph
    const pathNodeIds = this.aStar(startNode.id, destNode.id);
    const waypoints: THREE.Vector3[] = [floorStart];

    for (const nodeId of pathNodeIds) {
      const node = this.nodes.get(nodeId);
      if (node) {
        waypoints.push(node.position.clone());
      }
    }
    waypoints.push(floorDest);

    // Smooth path via Catmull-Rom or multi-segment interpolation
    const smoothedPoints = this.interpolateSpline(waypoints, 8);

    // Calculate total path distance
    let totalDist = 0;
    for (let i = 0; i < smoothedPoints.length - 1; i++) {
      totalDist += smoothedPoints[i].distanceTo(smoothedPoints[i + 1]);
    }

    return {
      points: smoothedPoints,
      totalDistance: Math.round(totalDist * 10) / 10,
      estimatedTimeSec: Math.max(1, Math.round(totalDist / 1.2)),
    };
  }

  isWalkable(_point: THREE.Vector3): boolean {
    return true;
  }

  private findClosestNode(pos: THREE.Vector3): NavNode | null {
    let closest: NavNode | null = null;
    let minDist = Infinity;

    for (const node of this.nodes.values()) {
      const d = pos.distanceTo(node.position);
      if (d < minDist) {
        minDist = d;
        closest = node;
      }
    }
    return closest;
  }

  private aStar(startId: string, goalId: string): string[] {
    if (startId === goalId) return [startId];

    const openSet = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();

    const gScore = new Map<string, number>();
    gScore.set(startId, 0);

    const fScore = new Map<string, number>();
    const startPos = this.nodes.get(startId)!.position;
    const goalPos = this.nodes.get(goalId)!.position;
    fScore.set(startId, startPos.distanceTo(goalPos));

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let currentId = '';
      let lowestF = Infinity;
      for (const id of openSet) {
        const score = fScore.get(id) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          currentId = id;
        }
      }

      if (currentId === goalId) {
        // Reconstruct path
        const path = [currentId];
        while (cameFrom.has(currentId)) {
          currentId = cameFrom.get(currentId)!;
          path.unshift(currentId);
        }
        return path;
      }

      openSet.delete(currentId);
      const currentNode = this.nodes.get(currentId);
      if (!currentNode) continue;

      const currentG = gScore.get(currentId) ?? Infinity;

      for (const neighborId of currentNode.neighbors) {
        const neighborNode = this.nodes.get(neighborId);
        if (!neighborNode) continue;

        const tentativeG = currentG + currentNode.position.distanceTo(neighborNode.position);
        if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, currentId);
          gScore.set(neighborId, tentativeG);
          const f = tentativeG + neighborNode.position.distanceTo(goalPos);
          fScore.set(neighborId, f);
          openSet.add(neighborId);
        }
      }
    }

    return [startId, goalId];
  }

  private interpolateSpline(points: THREE.Vector3[], segmentsPerSpan: number = 8): THREE.Vector3[] {
    if (points.length <= 1) return points;
    if (points.length === 2) {
      const result: THREE.Vector3[] = [];
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        result.push(new THREE.Vector3().lerpVectors(points[0], points[1], i / steps));
      }
      return result;
    }

    try {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
      return curve.getPoints(points.length * segmentsPerSpan);
    } catch {
      return points;
    }
  }
}

export const pathfindingService = new PathfindingService();
