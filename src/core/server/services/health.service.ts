import { checkDBHealth } from '@core/database';
import type {
  DatabaseHealthResponse,
  PackageJson,
  ServerCPUInfo,
  ServerInfo,
  ServerMemoryInfo,
} from '@shared/types';
import logger from '@shared/utils/logger';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export class ServerInfoService {
  private packageJsonPath: string;

  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
  }

  private async readPackageJson(): Promise<PackageJson> {
    try {
      const packageJsonContent = await fs.readFile(this.packageJsonPath, 'utf-8');
      return JSON.parse(packageJsonContent);
    } catch (error) {
      logger.error('Error reading package.json:', error);
      throw new Error('Could not read package.json');
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private getMemoryUsage(): ServerMemoryInfo {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      total: this.formatBytes(totalMemory),
      free: this.formatBytes(freeMemory),
      used: this.formatBytes(usedMemory),
      usage_percentage: `${((usedMemory / totalMemory) * 100).toFixed(2)}%`,
    };
  }

  private getCPUInfo(): ServerCPUInfo {
    return {
      cores: os.cpus().length,
      load_average: os.loadavg().map((avg) => Number(avg.toFixed(2))),
    };
  }

  public async getServerInfo(): Promise<ServerInfo> {
    try {
      const packageJson = await this.readPackageJson();
      const dbHealth: DatabaseHealthResponse = await checkDBHealth();

      const memoryUsage = this.getMemoryUsage();
      const cpuInfo = this.getCPUInfo();

      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        server: {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: memoryUsage,
          cpu: cpuInfo,
        },
        application: {
          name: packageJson.name,
          version: packageJson.version,
          environment: process.env.NODE_ENV || 'development',
        },
        database: dbHealth,
        system: {
          hostname: os.hostname(),
          user: os.userInfo().username,
          uptime: os.uptime(),
        },
      };
    } catch (error) {
      logger.error('Error getting server info:', error);
      throw error;
    }
  }
}

export const serverInfoService = new ServerInfoService();
