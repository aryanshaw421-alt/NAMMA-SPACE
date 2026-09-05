import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const modelsRouter = Router();

function getProcessedDir(): string {
  if (process.env.DATA_PROCESSED_PATH) {
    return path.resolve(process.env.DATA_PROCESSED_PATH);
  }
  // Check relative to cwd
  const cwdCandidate = path.resolve(process.cwd(), 'data/processed');
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  const parentCandidate = path.resolve(process.cwd(), '../data/processed');
  if (fs.existsSync(parentCandidate)) return parentCandidate;

  // Fallback relative to __dirname
  return path.resolve(__dirname, '../../../data/processed');
}

// Route to list available processed 3D models
modelsRouter.get('/', (_req: Request, res: Response): void => {
  const processedDir = getProcessedDir();

  try {
    if (!fs.existsSync(processedDir)) {
      res.json({ models: [], processedDir });
      return;
    }

    const files = fs.readdirSync(processedDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.glb', '.gltf', '.obj', '.ply'].includes(ext);
    });

    res.json({
      models: files.map((fileName) => ({
        id: fileName,
        name: fileName,
        format: path.extname(fileName).replace('.', '').toLowerCase(),
        path: `/models/${fileName}`,
      })),
      processedDir,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list digital twin models', details: String(error) });
  }
});

