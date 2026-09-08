import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { healthRouter } from './routes/health.js';
import { modelsRouter } from './routes/models.js';
import { poisRouter } from './routes/pois.js';
import { searchRouter } from './routes/search.js';
import { navigationRouter } from './routes/navigation.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Resolve processed data directory
function getProcessedDataPath(): string {
  if (process.env.DATA_PROCESSED_PATH) {
    return path.resolve(process.env.DATA_PROCESSED_PATH);
  }
  const cwdCandidate = path.resolve(process.cwd(), 'data/processed');
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;
  const parentCandidate = path.resolve(process.cwd(), '../data/processed');
  if (fs.existsSync(parentCandidate)) return parentCandidate;
  return path.resolve(__dirname, '../../../data/processed');
}

const processedDataPath = getProcessedDataPath();
app.use(
  '/models',
  express.static(processedDataPath, {
    dotfiles: 'ignore',
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.glb')) {
        res.setHeader('Content-Type', 'model/gltf-binary');
      } else if (filePath.endsWith('.gltf')) {
        res.setHeader('Content-Type', 'model/gltf+json');
      }
    },
  })
);

// Domain Routes
app.use('/api/health', healthRouter);
app.use('/api/models', modelsRouter);
app.use('/api/pois', poisRouter);
app.use('/api/search', searchRouter);
app.use('/api/navigation', navigationRouter);

// Root greeting & API index
app.get('/', (_req, res) => {
  res.json({
    message: 'Namma Space Spatial Engine API',
    version: '0.2.0',
    phase: 'Complete: 3D Digital Twin Engine, POI Tagging, & Indoor Wayfinding',
    endpoints: {
      health: '/api/health',
      models: '/api/models',
      modelById: '/api/models/:id',
      modelFile: '/api/models/:id/file',
      pois: '/api/pois',
      search: '/api/search',
      navigation: '/api/navigation/route',
    },
  });
});

// Centralized 404 and Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Namma Space Backend] Server listening on port ${PORT}`);
  console.log(`[Namma Space Backend] Serving 3D models from: ${processedDataPath}`);
});


