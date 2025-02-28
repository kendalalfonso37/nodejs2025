import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getForbidden, getUnauthorized } from "../helpers/httpErrorHelper";

dotenv.config();
const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw getUnauthorized(`No esta autorizado por Chayanne.`); // TODO: CAMBIAR MENSAJE
    }

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        throw getForbidden("Pues no, mi ciela."); // TODO: CAMBIAR MENSAJE
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error); // Pasar el error al manejador de errores de Express
  }
};
