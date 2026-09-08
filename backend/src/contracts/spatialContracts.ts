/**
 * Spatial Integration Contracts for Namma Space
 * Defines interfaces and data types for future Member 3 spatial engine integration:
 * - POI Management & Semantic Annotations
 * - Metric Proximity & Spatial Search Index
 * - Obstacle-Aware NavMesh / Graph Pathfinding
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// ==============================================================================
// 1. Point of Interest (POI) Domain Contract
// ==============================================================================

export interface PointOfInterestEntity {
  id: string;
  title: string;
  category: string;
  position: Vector3D;
  normal?: Vector3D;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export type CreatePOIDTO = Omit<PointOfInterestEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePOIDTO = Partial<CreatePOIDTO>;

export interface IPOIServiceContract {
  getAllPOIs(): Promise<PointOfInterestEntity[]>;
  getPOIById(id: string): Promise<PointOfInterestEntity | null>;
  createPOI(poi: CreatePOIDTO): Promise<PointOfInterestEntity>;
  updatePOI(id: string, updates: UpdatePOIDTO): Promise<PointOfInterestEntity | null>;
  deletePOI(id: string): Promise<boolean>;
}

// ==============================================================================
// 2. Spatial Search & Proximity Contract
// ==============================================================================

export interface SpatialSearchQuery {
  query?: string;
  category?: string;
  origin?: Vector3D;
  maxRadiusMeters?: number;
  limit?: number;
}

export interface SpatialSearchResultItem {
  poi: PointOfInterestEntity;
  distanceMeters?: number;
  relevanceScore: number;
}

export interface ISpatialSearchServiceContract {
  search(params: SpatialSearchQuery): Promise<SpatialSearchResultItem[]>;
  findNearest(position: Vector3D, maxRadiusMeters?: number): Promise<SpatialSearchResultItem[]>;
}

// ==============================================================================
// 3. Navigation & Indoor Wayfinding Contract
// ==============================================================================

export interface PathfindingRequestDTO {
  start: Vector3D;
  destination: Vector3D;
  algorithm?: 'A_STAR' | 'DIJKSTRA';
  allowElevator?: boolean;
}

export interface NavigationPathDTO {
  waypoints: Vector3D[];
  totalDistanceMeters: number;
  estimatedWalkTimeSeconds: number;
  isObstacleFree: boolean;
  navMeshVersion?: string;
}

export interface INavigationServiceContract {
  calculateRoute(request: PathfindingRequestDTO): Promise<NavigationPathDTO | null>;
  isPositionWalkable(position: Vector3D): Promise<boolean>;
}
