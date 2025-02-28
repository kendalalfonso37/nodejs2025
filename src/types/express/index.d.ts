import jwt from "jsonwebtoken";

export {}; // Necesario para que TypeScript trate esto como un módulo

declare global {
  namespace Express {
    export interface Request {
      user?: string | jwt.JwtPayload | undefined;
    }
  }
}
