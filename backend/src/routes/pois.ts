import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const poisRouter = Router();

export interface PointOfInterest {
  id: string;
  title: string;
  category: string;
  position: { x: number; y: number; z: number };
  normal?: { x: number; y: number; z: number };
  description?: string;
  tags?: string[];
  createdAt?: string;
}

function getPoisFilePath(): string {
  const cwdCandidate = path.resolve(process.cwd(), 'data/pois.json');
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  const parentCandidate = path.resolve(process.cwd(), '../data/pois.json');
  if (fs.existsSync(parentCandidate)) return parentCandidate;

  return path.resolve(__dirname, '../../../data/pois.json');
}

function readPois(): PointOfInterest[] {
  const filePath = getPoisFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading POIs:', error);
    return [];
  }
}

function writePois(pois: PointOfInterest[]): boolean {
  const filePath = getPoisFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(pois, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing POIs:', error);
    return false;
  }
}

// GET /api/pois - List all POIs
poisRouter.get('/', (_req: Request, res: Response): void => {
  const pois = readPois();
  res.json({
    count: pois.length,
    pois,
  });
});

// GET /api/pois/:id - Get specific POI
poisRouter.get('/:id', (req: Request, res: Response): void => {
  const pois = readPois();
  const poi = pois.find((p) => p.id === req.params.id);
  if (!poi) {
    res.status(404).json({ error: 'POI not found' });
    return;
  }
  res.json(poi);
});

// POST /api/pois - Create new POI
poisRouter.post('/', (req: Request, res: Response): void => {
  const { title, category, position, normal, description, tags } = req.body;

  if (!title || !category || !position || typeof position.x !== 'number') {
    res.status(400).json({ error: 'Missing required POI fields (title, category, position.x/y/z)' });
    return;
  }

  const pois = readPois();
  const newPoi: PointOfInterest = {
    id: `poi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: String(title).trim(),
    category: String(category).trim(),
    position: {
      x: Number(position.x),
      y: Number(position.y),
      z: Number(position.z),
    },
    normal: normal
      ? { x: Number(normal.x), y: Number(normal.y), z: Number(normal.z) }
      : undefined,
    description: description ? String(description).trim() : '',
    tags: Array.isArray(tags) ? tags.map(String) : [],
    createdAt: new Date().toISOString(),
  };

  pois.push(newPoi);
  if (writePois(pois)) {
    res.status(201).json(newPoi);
  } else {
    res.status(500).json({ error: 'Failed to persist POI to data/pois.json' });
  }
});

// DELETE /api/pois/:id - Delete POI
poisRouter.delete('/:id', (req: Request, res: Response): void => {
  const pois = readPois();
  const index = pois.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'POI not found' });
    return;
  }

  const [deleted] = pois.splice(index, 1);
  if (writePois(pois)) {
    res.json({ success: true, deletedPoi: deleted });
  } else {
    res.status(500).json({ error: 'Failed to delete POI' });
  }
});
