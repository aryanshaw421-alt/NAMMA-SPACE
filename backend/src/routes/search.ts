import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';

export const searchRouter = Router();

// GET /api/search - Spatial query placeholder (contract established)
searchRouter.get('/', SearchController.search);
