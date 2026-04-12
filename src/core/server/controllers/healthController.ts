import { serverInfoService } from '@core/server/services/health.service';
import logger from '@shared/utils/logger';
import type { Request, Response } from 'express';

export class HealthController {
  public async getServerInfo(_: Request, res: Response) {
    try {
      const serverInfo = await serverInfoService.getServerInfo();
      res.status(200).json(serverInfo);
    } catch (error) {
      logger.error('Error in server info endpoint:', error);
      res.status(500).json({
        status: 'error',
        message: 'Could not retrieve server information',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const healthController = new HealthController();
