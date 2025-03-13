import { Request, Response } from "express";
import logger from "../utils/logger";
import { User } from "../entity/User";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { UserRegisterRequest } from "../requests/userRegisterRequest";
import { generatePassword } from "../helpers/authHelper";
import { StatusCodes } from "http-status-codes";

export const getUsers = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo usuarios", action: "getUsers" });

  try {
    const { page, records, sortBy, sortOrder, search, filters } = req.query;

    const userRepository = myDataSource.getRepository(User);

    const paginationParams: PaginationParams<User> = {
      page: Number(page) || undefined,
      records: Number(records) || undefined,
      sortBy: sortBy as keyof User, // Acepta cualquier campo de User
      sortOrder: sortOrder as "ASC" | "DESC",
      search: search as string,
      filters: filters ? JSON.parse(filters as string) : undefined
    };

    logger.info({
      message: "Filtros usados para la busqueda",
      action: "getUsers",
      paginationParams
    });

    // Buscamos nuestros users y a la ves mandamos que campos no queremos recuperar, para ocultar informacion sensible.
    const users = await getPaginatedData(userRepository, paginationParams, [
      "tokenVersion",
      "password"
    ]);

    res.json(users);
  } catch (error) {
    logger.error("Error al obtener usuarios paginados:", error);
    getInternalServerError(res, `Error al obtener la lista de usuarios.`);
    return;
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del usuario", action: "getUserDetails" });

  const id = req.params.id;

  try {
    const userRepository = myDataSource.getRepository(User);

    const userFound = await userRepository.findOneByOrFail({
      id: Number(id)
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, tokenVersion, ...safeUser } = userFound; // Excluir campos sensibles por medio de Object spread operator.

    res.json(safeUser);
  } catch (error) {
    logger.error("Usuario no encontrado", error);
    getNotFound(res, `Usuario no encontrado`);
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tokenVersion, password, ...safeUser } = newUser;

    logger.info({ message: `El usuario ha sido creado exitosamente.`, action: "register" });
    res
      .status(StatusCodes.CREATED)
      .json({ message: `El usuario ha sido creado exitosamente.`, data: safeUser });
  } catch (error) {
    logger.error({ message: "Ocurrio un error al crear el usuario", action: "register", error });
    getInternalServerError(res, `Ocurrio un error al crear el usuario: ${error}`);
    return;
  }
};

// updateUser, buscar el user, actualizar username y email, mismas validaciones y misma request que userCreateRequest, devolver mensaje y el user actualizado.

// deleteUser, buscar el user, actualizar campo deletedAt y devolver mensaje de actualizacion y el user.
