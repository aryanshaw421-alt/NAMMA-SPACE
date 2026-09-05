import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { healthRouter } from './routes/health.js';
import { modelsRouter } from './routes/models.js';

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
app.use('/models', express.static(processedDataPath));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/models', modelsRouter);

// Root greeting & API index
app.get('/', (_req, res) => {
  res.json({
    message: 'Namma Space Spatial Engine API',
    version: '0.1.0',
    phase: 'Round 1: 3D Digital Twin Viewer Foundation',
    endpoints: {
      health: '/api/health',
      models: '/api/models',
    },
  });
});

app.listen(PORT, () => {
  console.log(`[Namma Space Backend] Server listening on port ${PORT}`);
  console.log(`[Namma Space Backend] Serving 3D models from: ${processedDataPath}`);
});

