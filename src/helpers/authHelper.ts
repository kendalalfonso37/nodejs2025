import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../utils/logger";

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS as string) || 12;
const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET as string;

export const generatePassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const validatePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const result: boolean = await bcrypt.compare(password, hashedPassword);
  return result;
};

export const verifyRefreshToken = async (refreshToken: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload;
    if (decoded) {
      return true; // Devuelve el payload si es válido y no ha expirado
    }
    return false;
  } catch (err) {
    logger.error(`Error verificando refreshToken: ${err}`);
    return false; // Token inválido o expirado
  }
};
