import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'namma-space-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    round: 'Round 1 - Foundation & 3D Viewer Infrastructure',
  });
});
