import { Router } from 'express';
import { NavigationController } from '../controllers/navigationController.js';

export const navigationRouter = Router();

// POST /api/navigation/route - Navigation pathfinding placeholder (contract established)
navigationRouter.post('/route', NavigationController.calculateRoute);
