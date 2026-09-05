/**
 * Point of Interest (POI) Service Interface
 * Prepared for Round 2: Interactive spatial annotations, pins, and metadata binding.
 */

import type { PointOfInterest } from '../types';

export interface IPOIService {
  getPOIs(): Promise<PointOfInterest[]>;
  addPOI(poi: Omit<PointOfInterest, 'id' | 'createdAt'>): Promise<PointOfInterest>;
  removePOI(id: string): Promise<boolean>;
  getPOIById(id: string): Promise<PointOfInterest | null>;
}

export class POIService implements IPOIService {
  // Stubbed implementation ready for Round 2 persistence
  async getPOIs(): Promise<PointOfInterest[]> {
    return [];
  }

  async addPOI(_poi: Omit<PointOfInterest, 'id' | 'createdAt'>): Promise<PointOfInterest> {
    throw new Error('POI System is scheduled for Round 2 implementation.');
  }

  async removePOI(_id: string): Promise<boolean> {
    throw new Error('POI System is scheduled for Round 2 implementation.');
  }

  async getPOIById(_id: string): Promise<PointOfInterest | null> {
    return null;
  }
}

export const poiService = new POIService();
