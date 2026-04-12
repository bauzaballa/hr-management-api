export type DBConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export type AppConfig = {
  env: 'development' | 'production' | 'test';
  apiAuthUrl: string;
  apiAuthKey: string;
  secretJwtKey: string;
  whiteList: string[];
  port: number;
  db: DBConfig;
  socketApi: string;
  apiDirectionUrl: string;
};
