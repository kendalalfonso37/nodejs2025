import { Request, Response } from "express";
import logger from "../utils/logger";
import { UserRegisterRequest } from "../requests/userRegisterRequest";
import { User } from "../entity/User";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getUnauthorized } from "../helpers/httpErrorHelper";
import { StatusCodes } from "http-status-codes";
import { UserLoginRequest } from "../requests/userLoginRequest";
import { generatePassword, validatePassword, verifyRefreshToken } from "../helpers/authHelper";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshExpirationTime,
  IUserPayload
} from "../helpers/jsonWebTokenHelper";
import { RefreshToken } from "../entity/RefreshToken";
import jwt from "jsonwebtoken";
import { accessTokenSecret } from "../middlewares/jsonWebTokenAuth";

export const register = async (req: Request, res: Response) => {
  logger.info({ message: "Registrando nuevo usuario.", action: "register" });

  const userRegisterRequest: UserRegisterRequest = req.body;
  const userRepository = myDataSource.getRepository(User);

  // Buscar que el username y el email no hayan sido registrados previamente:
  const userFound = await userRepository.findOne({
    where: { username: userRegisterRequest.username }
  });

  const emailFound = await userRepository.findOne({ where: { email: userRegisterRequest.email } });

  if (userFound || emailFound) {
    logger.error({
      message: "El usuario o correo ya ha sido registrado previamente.",
      action: "register"
    });
    getBadRequest(res, `El usuario o correo ya ha sido registrado previamente.`);
    return;
  }

  // Crear el nuevo usuario
  const hashedPassword = await generatePassword(userRegisterRequest.password);
  try {
    const newUser = userRepository.create({
      username: userRegisterRequest.username,
      email: userRegisterRequest.email,
      password: hashedPassword
    });

    await userRepository.save(newUser);

    // Opcional crear el token y el refreshToken o mandar mensaje que el usuario ha sido registrado exitosamente.
    logger.info({ message: `El usuario ha sido creado exitosamente.`, action: "register" });
    res.status(StatusCodes.CREATED).json({ message: `El usuario ha sido creado exitosamente.` });
  } catch (error) {
    logger.error({ message: "Ocurrio un error al crear el usuario", action: "register", error });
    getInternalServerError(res, `Ocurrio un error al crear el usuario: ${error}`);
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  const userLoginRequest: UserLoginRequest = req.body;

  logger.info({ message: "Iniciando sesion para el usuario.", action: "login" });

  // Buscar el usuario por medio del correo
  const userRepository = myDataSource.getRepository(User);
  const userFound = await userRepository.findOne({
    where: { email: userLoginRequest.email }
  });

  // Validar la password
  if (
    !userFound ||
    !(await validatePassword(userLoginRequest.password, userFound.password as string))
  ) {
    logger.error({
      message: "Usuario o contraseña incorrecta.",
      action: "login"
    });
    getBadRequest(res, `Usuario o contraseña incorrecta.`);
    return;
  }

  // Validar si el usuario esta activo:
  if (!userFound.isActive) {
    logger.error({
      message: "Usuario desactivado, , no se puede iniciar sesion.",
      action: "login"
    });
    getBadRequest(res, `Usuario desactivado, no se puede iniciar sesion.`);
    return;
  }

  // Crear el payload para el Json Web Token
  const userPayload: IUserPayload = {
    id: userFound.id as number,
    username: userFound.username as string,
    tokenVersion: userFound.tokenVersion as number
  };

  // Generar el token y el refreshToken
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  // Guardar en base de datos el refreshToken
  const refreshTokenRepository = await myDataSource.getRepository(RefreshToken);
  try {
    // Devolver en la response el token y el refreshToken
    const newRefreshToken = refreshTokenRepository.create({
      refreshToken: refreshToken,
      user: userFound,
      expirationTime: getRefreshExpirationTime()
    });
    await refreshTokenRepository.save(newRefreshToken);

    logger.info({ message: `Inicio de sesion exitoso.`, action: "login" });
    res.status(StatusCodes.OK).json({ accessToken, refreshToken });
  } catch (error) {
    logger.error({ message: "Ocurrio un error inesperado:", action: "login", error });
    getInternalServerError(res, `Ocurrio un error inesperado: ${error}`);
    return;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // Sacar refreshToken del Body.
  const { refreshToken } = req.body;

  // Buscar refreshToken en la base de datos.
  const refreshTokenRepository = await myDataSource.getRepository(RefreshToken);

  const refreshTokenFound = await refreshTokenRepository.findOne({
    where: { refreshToken: refreshToken },
    relations: ["user"]
  });

  if (!refreshTokenFound) {
    logger.error({ message: "refreshToken no valido.", action: "refreshToken" });
    getUnauthorized(res, `refreshToken no valido.`);
    return;
  }

  // verificar si el refreshToken es valido. (jwt.sign)
  if (!(await verifyRefreshToken(refreshToken))) {
    logger.error({ message: `refreshToken expirado.`, action: "refreshToken" });
    getUnauthorized(res, `refreshToken expirado.`);
    return;
  }

  // Buscar el username
  const userFound = refreshTokenFound.user;

  // Crear el payload para el Json Web Token
  const userPayload: IUserPayload = {
    id: userFound?.id as number,
    username: userFound?.username as string,
    tokenVersion: userFound?.tokenVersion as number
  };

  // Generar el token y el refreshToken
  const accessToken = generateAccessToken(userPayload);
  const newRefreshTokenString = generateRefreshToken(userPayload);

  // retornarlos en la response.
  try {
    // Devolver en la response el token y el refreshToken
    const newRefreshToken = refreshTokenRepository.create({
      refreshToken: newRefreshTokenString,
      user: userFound as User,
      expirationTime: getRefreshExpirationTime()
    });
    await refreshTokenRepository.save(newRefreshToken);

    logger.info({ message: `Refresh token exitoso.`, action: "refreshToken" });
    res.status(StatusCodes.OK).json({ accessToken, refreshToken: newRefreshToken.refreshToken });
  } catch (error) {
    logger.error({ message: "Ocurrio un error inesperado.", action: "refreshToken", error });
    getInternalServerError(res, `Ocurrio un error inesperado: ${error}`);
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  // recuperar el token de la request.
  const { accessToken, refreshToken } = req.body;

  if (!accessToken) {
    logger.error({ message: `Token de acceso no valido.`, action: "logout" });
    getBadRequest(res, `Token de acceso no valido.`);
    return;
  }

  // Invalidar refreshToken
  try {
    // Buscar refreshToken en la base de datos.
    const refreshTokenRepository = await myDataSource.getRepository(RefreshToken);

    const refreshTokenFound = await refreshTokenRepository.findOne({
      where: { refreshToken: refreshToken },
      relations: ["user"]
    });

    if (!refreshTokenFound) {
      logger.error({ message: "refreshToken no valido.", action: "refreshToken" });
      getBadRequest(res, `refreshToken no valido.`);
      return;
    }

    refreshTokenRepository.remove(refreshTokenFound);
  } catch (error) {
    logger.error({
      message: `Ocurrio un error al eliminar el refreshToken.`,
      action: "logout",
      error
    });
    getInternalServerError(res, `Ocurrio un error al eliminar el refreshToken.`);
    return;
  }

  // incrementar tokenResponse aqui para invalidar todos los tokens anteriores del usuario.
  jwt.verify(accessToken, accessTokenSecret, async (err: unknown, user: unknown) => {
    if (err) {
      logger.error({
        message: `Ocurrio un error al verificar el token.`,
        action: "logout",
        error: err
      });
      getBadRequest(res, "Ocurrio un error al verificar el token.");
      return;
    }

    req.user = undefined;
    // Validar tokenVersion del User
    try {
      const userRepository = myDataSource.getRepository(User);
      const userFound = await userRepository.findOne({
        where: { id: (user as IUserPayload).id as number }
      });

      if (!userFound || userFound.tokenVersion !== (user as IUserPayload).tokenVersion) {
        return res.status(403).json({ message: "Refresh token inválido." });
      }

      userFound.tokenVersion += 1;
      await userRepository.save(userFound);

      // Retornar mensaje de cierre de sesion.
      res.status(StatusCodes.OK).json({ message: `Cierre de sesion exitoso.` });
    } catch (error) {
      logger.error({ message: `Ocurrio un error al cerrar sesion.`, action: "logout", error });
      getInternalServerError(res, `Ocurrio un error al cerrar sesion.`);
      return;
    }
  });
};
