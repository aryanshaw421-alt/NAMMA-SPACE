import { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { ModelService } from '../services/modelService.js';
import { formatSuccessResponse } from '../types/api.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

export class ModelController {
  /**
   * GET /api/models
   * Lists available 3D digital twin models in data/processed/.
   */
  static listModels(_req: Request, res: Response, next: NextFunction): void {
    try {
      const result = ModelService.listModels();
      // Provide standard format with top-level compatibility keys for existing frontend
      res.json(
        formatSuccessResponse(result, {
          models: result.models,
          processedDir: result.processedDir,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/models/:id
   * Retrieves metadata for a specific model ID.
   */
  static getModelById(req: Request, res: Response, next: NextFunction): void {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestError('Model ID parameter cannot be empty');
      }

      let model;
      try {
        model = ModelService.getModelById(id.trim());
      } catch (serviceErr) {
        const msg = serviceErr instanceof Error ? serviceErr.message : String(serviceErr);
        if (msg.includes('Path traversal') || msg.includes('Invalid model ID') || msg.includes('Unsupported model format')) {
          throw new BadRequestError(msg);
        }
        if (msg.includes('Access denied')) {
          throw new ForbiddenError(msg);
        }
        throw serviceErr;
      }

      if (!model) {
        throw new NotFoundError(`Model "${id}" not found in processed directory`, { id });
      }

      res.json(formatSuccessResponse(model, { ...model }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/models/:id/file
   * Streams raw 3D model binary (GLB/GLTF/OBJ) with proper content headers.
   */
  static streamModelFile(req: Request, res: Response, next: NextFunction): void {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestError('Model ID parameter cannot be empty');
      }

      let filePath: string | null;
      try {
        filePath = ModelService.getModelFilePath(id.trim());
      } catch (serviceErr) {
        const msg = serviceErr instanceof Error ? serviceErr.message : String(serviceErr);
        if (msg.includes('Path traversal') || msg.includes('Invalid model ID') || msg.includes('Unsupported model format')) {
          throw new BadRequestError(msg);
        }
        if (msg.includes('Access denied')) {
          throw new ForbiddenError(msg);
        }
        throw serviceErr;
      }

      if (!filePath) {
        throw new NotFoundError(`Model file "${id}" not found`, { id });
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.glb': 'model/gltf-binary',
        '.gltf': 'model/gltf+json',
        '.obj': 'model/obj',
        '.ply': 'application/octet-stream',
      };

      const contentType = mimeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}
