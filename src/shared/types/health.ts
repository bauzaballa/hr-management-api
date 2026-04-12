export interface DatabaseHealth {
  status: string;
  timestamp: string;
  ping: string;
  database_version: string;
  connections: {
    total: number;
    idle: number;
    waiting: number;
    active: number;
    max_allowed: number;
  };
  utilization: {
    pool: string;
    system: string;
  };
}

export interface DatabaseHealthError {
  status: string;
  error: string;
  timestamp: string;
  connections: {
    total: number;
    idle: number;
    waiting: number;
  };
}

export type DatabaseHealthResponse = DatabaseHealth | DatabaseHealthError;

// El resto de las interfaces se mantienen igual...
export interface ServerMemoryInfo {
  total: string;
  free: string;
  used: string;
  usage_percentage: string;
}

export interface ServerCPUInfo {
  cores: number;
  load_average: number[];
}

export interface ServerInfo {
  status: string;
  timestamp: string;
  uptime: number;
  server: {
    node_version: string;
    platform: string;
    arch: string;
    memory: ServerMemoryInfo;
    cpu: ServerCPUInfo;
  };
  application: {
    name: string;
    version: string;
    environment: string;
  };
  database: DatabaseHealthResponse;
  system: {
    hostname: string;
    user: string;
    uptime: number;
  };
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
