import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUnauthorized } from "../helpers/httpErrorHelper";
import logger from "../utils/logger";
import { myDataSource } from "../app-data-source";
import { User } from "../entity/User";
import { IUserPayload } from "../helpers/jsonWebTokenHelper";
import { StatusCodes } from "http-status-codes";

dotenv.config();
export const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.error(`Token de acceso no valido.`);
      getUnauthorized(res, `Token de acceso no valido.`);
      return;
    }

    jwt.verify(token, accessTokenSecret, async (err, user) => {
      if (err) {
        logger.error(`No esta autorizado para acceder a este recurso.`);
        getUnauthorized(res, "No esta autorizado para acceder a este recurso.");
        return;
      }

      // Validar tokenVersion del User
      const userRepository = myDataSource.getRepository(User);
      const userFound = await userRepository.findOne({
        where: { id: (user as IUserPayload).id as number }
      });

      if (!userFound || userFound.tokenVersion !== (user as IUserPayload).tokenVersion) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Refresh token inválido." });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};
