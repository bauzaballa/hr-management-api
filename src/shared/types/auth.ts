import type { JwtPayload } from 'jsonwebtoken';

export interface DecodedToken extends JwtPayload {
  id: string; // UUID del usuario
  departments: string[];
}

declare global {
  namespace Express {
    interface Request {
      decodedToken: DecodedToken;
    }
  }
}
