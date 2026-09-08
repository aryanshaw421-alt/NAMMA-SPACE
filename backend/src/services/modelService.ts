import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ALLOWED_MODEL_EXTENSIONS = new Set(['.glb', '.gltf', '.obj', '.ply']);

export interface ModelMetadata {
  id: string;
  name: string;
  format: string;
  path: string;
  sizeBytes: number;
  updatedAt: string;
}

export class ModelService {
  /**
   * Resolves the processed data directory path reliably across different execution contexts.
   */
  static getProcessedDir(): string {
    if (process.env.DATA_PROCESSED_PATH) {
      return path.resolve(process.env.DATA_PROCESSED_PATH);
    }
    const cwdCandidate = path.resolve(process.cwd(), 'data/processed');
    if (fs.existsSync(cwdCandidate)) return cwdCandidate;

    const parentCandidate = path.resolve(process.cwd(), '../data/processed');
    if (fs.existsSync(parentCandidate)) return parentCandidate;

    return path.resolve(__dirname, '../../../data/processed');
  }

  /**
   * Sanitizes and validates a requested model ID to prevent path traversal attacks.
   * Returns sanitized ID or throws an error with a descriptive message.
   */
  static sanitizeModelId(id: string): string {
    if (!id || typeof id !== 'string') {
      throw new Error('Model ID is required');
    }

    // Reject null bytes, directory traversal patterns, and slashes
    if (id.includes('\0') || id.includes('/') || id.includes('\\') || id.includes('..')) {
      throw new Error('Path traversal or invalid characters detected in model ID');
    }

    const base = path.basename(id);
    if (base !== id) {
      throw new Error('Invalid model ID format');
    }

    const ext = path.extname(base).toLowerCase();
    if (!ALLOWED_MODEL_EXTENSIONS.has(ext)) {
      throw new Error(
        `Unsupported model format "${ext}". Allowed formats: ${Array.from(ALLOWED_MODEL_EXTENSIONS).join(', ')}`
      );
    }

    return base;
  }

  /**
   * Lists all available processed 3D models with metadata.
   */
  static listModels(): { models: ModelMetadata[]; processedDir: string } {
    const processedDir = this.getProcessedDir();

    if (!fs.existsSync(processedDir)) {
      return { models: [], processedDir };
    }

    const files = fs.readdirSync(processedDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_MODEL_EXTENSIONS.has(ext);
    });

    const models: ModelMetadata[] = files.map((fileName) => {
      const filePath = path.join(processedDir, fileName);
      let sizeBytes = 0;
      let updatedAt = new Date().toISOString();

      try {
        const stat = fs.statSync(filePath);
        sizeBytes = stat.size;
        updatedAt = stat.mtime.toISOString();
      } catch {
        // Fallback gracefully if stat fails
      }

      return {
        id: fileName,
        name: fileName,
        format: path.extname(fileName).replace('.', '').toLowerCase(),
        path: `/models/${fileName}`,
        sizeBytes,
        updatedAt,
      };
    });

    return { models, processedDir };
  }

  /**
   * Retrieves metadata for a specific model ID. Returns null if not found.
   */
  static getModelById(id: string): ModelMetadata | null {
    const sanitizedId = this.sanitizeModelId(id);
    const processedDir = this.getProcessedDir();
    const filePath = path.resolve(processedDir, sanitizedId);

    // Guarantee the path does not escape processedDir
    if (!filePath.startsWith(path.resolve(processedDir))) {
      throw new Error('Access denied: Path resides outside processed models directory');
    }

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stat = fs.statSync(filePath);
    return {
      id: sanitizedId,
      name: sanitizedId,
      format: path.extname(sanitizedId).replace('.', '').toLowerCase(),
      path: `/models/${sanitizedId}`,
      sizeBytes: stat.size,
      updatedAt: stat.mtime.toISOString(),
    };
  }

  /**
   * Resolves the secure absolute file path for streaming/downloading a model.
   */
  static getModelFilePath(id: string): string | null {
    const sanitizedId = this.sanitizeModelId(id);
    const processedDir = this.getProcessedDir();
    const filePath = path.resolve(processedDir, sanitizedId);

    if (!filePath.startsWith(path.resolve(processedDir))) {
      throw new Error('Access denied: Path resides outside processed models directory');
    }

    if (!fs.existsSync(filePath)) {
      return null;
    }

    return filePath;
  }
}
