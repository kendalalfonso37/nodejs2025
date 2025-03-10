import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS as string) || 12;
const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET as string;

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

export const verifyRefreshToken = async (refreshToken: string) => {
  jwt.verify(refreshToken, accessTokenSecret, (err) => {
    if (err) {
      return false;
    }
    return true;
  });
};
