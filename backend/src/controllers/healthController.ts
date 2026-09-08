import { Request, Response } from 'express';
import { formatSuccessResponse } from '../types/api.js';

export class HealthController {
  static getHealth(_req: Request, res: Response): void {
    const healthData = {
      status: 'ok',
      service: 'namma-space-backend',
      version: '0.2.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      round: 'Round 1 / Day 4 - Clean Modular Architecture',
    };

    // Include backward compatibility keys at top-level
    res.json(formatSuccessResponse(healthData, {
      status: healthData.status,
      service: healthData.service,
      version: healthData.version,
      timestamp: healthData.timestamp,
      round: healthData.round,
    }));
  }
}
