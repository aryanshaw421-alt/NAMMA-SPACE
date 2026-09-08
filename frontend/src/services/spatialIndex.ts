/**
 * Spatial Index & Search Service
 * Provides metric proximity querying, keyword matching, and spatial distance scoring.
 */

import type { PointOfInterest, SpatialSearchResult } from '../types';

export interface ISpatialIndexService {
  buildIndex(items: PointOfInterest[]): void;
  searchByKeyword(query: string, currentPosition?: { x: number; y: number; z: number }): Promise<SpatialSearchResult[]>;
  searchNearest(position: { x: number; y: number; z: number }, maxRadius?: number): Promise<SpatialSearchResult[]>;
}

export class SpatialIndexService implements ISpatialIndexService {
  private items: PointOfInterest[] = [];

  buildIndex(items: PointOfInterest[]): void {
    this.items = [...items];
  }

  async searchByKeyword(
    query: string,
    currentPosition?: { x: number; y: number; z: number }
  ): Promise<SpatialSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return all sorted by distance if available
      return this.items.map((item) => {
        const distance = currentPosition ? this.calcDistance(item.position, currentPosition) : 0;
        return { item, distance, score: 1.0 };
      }).sort((a, b) => a.distance - b.distance);
    }

    const results: SpatialSearchResult[] = [];

    for (const item of this.items) {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const catLower = item.category.toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      if (titleLower === q) score += 10;
      else if (titleLower.includes(q)) score += 5;

      if (catLower === q) score += 6;
      else if (catLower.includes(q)) score += 3;

      if (tags.includes(q)) score += 4;
      else if (tags.some((t) => t.includes(q))) score += 2;

      if (descLower.includes(q)) score += 1;

      if (score > 0) {
        const distance = currentPosition ? this.calcDistance(item.position, currentPosition) : 0;
        results.push({ item, distance, score });
      }
    }

    return results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.distance - b.distance;
    });
  }

  async searchNearest(
    position: { x: number; y: number; z: number },
    maxRadius: number = 100
  ): Promise<SpatialSearchResult[]> {
    const results: SpatialSearchResult[] = [];

    for (const item of this.items) {
      const distance = this.calcDistance(item.position, position);
      if (distance <= maxRadius) {
        results.push({
          item,
          distance,
          score: 1.0 / (1.0 + distance),
        });
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  private calcDistance(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number }
  ): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export const spatialIndexService = new SpatialIndexService();
