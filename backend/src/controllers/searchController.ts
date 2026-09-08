import { Request, Response, NextFunction } from 'express';
import { NotImplementedError } from '../middleware/errorHandler.js';

export class SearchController {
  /**
   * GET /api/search
   * Future spatial search endpoint contract.
   */
  static search(_req: Request, _res: Response, next: NextFunction): void {
    next(
      new NotImplementedError(
        'Spatial search service contract defined. Implementation scheduled for Member 3 spatial engine integration.'
      )
    );
  }
}
