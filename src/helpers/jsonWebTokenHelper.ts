import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "tu_secreto_access";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "tu_secreto_refresh";
const accessTokenExpiration = parseInt(process.env.ACCESS_TOKEN_EXPIRATION || "600"); // 10 min
const refreshTokenExpiration = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "1800"); // 30 min

export interface IUserPayload {
  id: number;
  username: string;
  tokenVersion: number; // Guardamos la tokenVersion utilizado cuando cierra sesion.
  // Otros campos que consideres necesarios
}

export const generateAccessToken = (user: IUserPayload): string => {
  return jwt.sign(user, accessTokenSecret, { expiresIn: accessTokenExpiration });
};

export const generateRefreshToken = (user: IUserPayload): string => {
  return jwt.sign(user, refreshTokenSecret, { expiresIn: refreshTokenExpiration });
};

export const getRefreshExpirationTime = (): Date => {
  return new Date(new Date().setSeconds(refreshTokenExpiration));
};
