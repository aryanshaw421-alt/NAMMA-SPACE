import { Router } from 'express';
import { ModelController } from '../controllers/modelController.js';

export const modelsRouter = Router();

// GET /api/models - List available processed 3D models
modelsRouter.get('/', ModelController.listModels);

// GET /api/models/:id - Get metadata for a specific 3D model
modelsRouter.get('/:id', ModelController.getModelById);

// GET /api/models/:id/file - Stream raw model binary with appropriate Content-Type
modelsRouter.get('/:id/file', ModelController.streamModelFile);


