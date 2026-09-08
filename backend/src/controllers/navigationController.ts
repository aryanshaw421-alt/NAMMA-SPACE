import { Request, Response, NextFunction } from 'express';
import { NotImplementedError } from '../middleware/errorHandler.js';

export class NavigationController {
  /**
   * POST /api/navigation/route
   * Future indoor pathfinding endpoint contract.
   */
  static calculateRoute(_req: Request, _res: Response, next: NextFunction): void {
    next(
      new NotImplementedError(
        'Navigation pathfinding service contract defined. Implementation scheduled for Member 3 NavMesh integration.'
      )
    );
  }
}
