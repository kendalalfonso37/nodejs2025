import { Request, Response } from "express";
import logger from "../utils/logger";
import { User } from "../entity/User";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { UserRegisterRequest } from "../requests/userRegisterRequest";
import { generatePassword } from "../helpers/authHelper";
import { StatusCodes } from "http-status-codes";
import { UserUpdateRequest } from "../requests/userUpdateRequest";
import { UserRoles } from "../entity/UserRoles";
import { In } from "typeorm";
import { Role } from "../entity/Role";

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
    logger.error({ message: "Error al obtener usuarios paginados", action: "getUsers", error });
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
    logger.error({ message: "Usuario no encontrado", action: "getUserDetails", error });
    getNotFound(res, `Usuario no encontrado`);
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {
  logger.info({ message: "Registrando nuevo usuario.", action: "createUser" });

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
      action: "createUser"
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

    logger.info({ message: `El usuario ha sido creado exitosamente.`, action: "createUser" });
    res
      .status(StatusCodes.CREATED)
      .json({ message: `El usuario ha sido creado exitosamente.`, data: safeUser });
  } catch (error) {
    logger.error({ message: "Ocurrio un error al crear el usuario", action: "createUser", error });
    getInternalServerError(res, `Ocurrio un error al crear el usuario: ${error}`);
    return;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del usuario", action: "updateUser" });

  const id = req.params.id;
  const userUpdateRequest: UserUpdateRequest = req.body;
  const userRepository = myDataSource.getRepository(User);

  const userFound = await userRepository.findOne({ where: { id: Number(id) } });
  if (!userFound) {
    logger.error({
      message: "Usuario no encontrado.",
      action: "updateUser"
    });
    getBadRequest(res, `Usuario no encontrado.`);
    return;
  }

  // Buscar que el username y el email no hayan sido registrados previamente:
  const usernameFound = await userRepository.findOne({
    where: { username: userUpdateRequest.username }
  });

  const emailFound = await userRepository.findOne({ where: { email: userUpdateRequest.email } });

  if (
    (usernameFound && usernameFound.id !== userFound.id) ||
    (emailFound && emailFound.id !== userFound.id)
  ) {
    logger.error({
      message: "El usuario o correo ya ha sido registrado previamente.",
      action: "updateUser"
    });
    getBadRequest(res, `El usuario o correo ya ha sido registrado previamente.`);
    return;
  }

  userFound.username = userUpdateRequest.username;
  userFound.email = userUpdateRequest.email;

  if (userUpdateRequest.password) {
    const hashedPassword = await generatePassword(userUpdateRequest.password);
    userFound.password = hashedPassword;
  }

  userFound.isActive = userUpdateRequest.isActive;

  try {
    userFound.updatedAt = new Date();
    userRepository.save(userFound);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tokenVersion, password, ...safeUser } = userFound;
    logger.info({ message: `El usuario ha sido actualizado exitosamente.`, action: "updateUser" });
    res
      .status(StatusCodes.OK)
      .json({ message: `El usuario ha sido actualizado exitosamente.`, data: safeUser });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al actualizar el usuario",
      action: "updateUser",
      error
    });
    getInternalServerError(res, `Ocurrio un error al actualizar el usuario: ${error}`);
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del usuario", action: "deleteUser" });

  const id = req.params.id;
  const userRepository = myDataSource.getRepository(User);

  const userFound = await userRepository.findOne({ where: { id: Number(id) } });
  if (!userFound) {
    logger.error({
      message: "Usuario no encontrado.",
      action: "deleteUser"
    });
    getBadRequest(res, `Usuario no encontrado.`);
    return;
  }

  try {
    userFound.deletedAt = new Date();
    userRepository.save(userFound);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tokenVersion, password, ...safeUser } = userFound;
    logger.info({ message: `El usuario ha sido eliminado exitosamente.`, action: "deleteUser" });
    res
      .status(StatusCodes.OK)
      .json({ message: `El usuario ha sido eliminado exitosamente.`, data: safeUser });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al eliminar el usuario",
      action: "deleteUser",
      error
    });
    getInternalServerError(res, `Ocurrio un error al eliminar el usuario: ${error}`);
    return;
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo roles del usuario", action: "getUserRoles" });

  const id = req.params.id;

  const userRepository = myDataSource.getRepository(User);

  const userFound = await userRepository.findOne({
    where: { id: Number(id) },
    relations: { userRoles: { role: true } }
    // select: {
    //   userRoles: {
    //     id: true,
    //     role: {
    //       id: true,
    //       name: true,
    //       isActive: true,
    //       description: true,
    //       createdAt: true,
    //       updatedAt: true,
    //       deletedAt: true
    //     }
    //   }
    // }
  });

  if (!userFound) {
    logger.error({ message: "Usuario no encontrado", action: "getUserRoles" });
    getNotFound(res, `Usuario no encontrado`);
    return;
  }

  res.json(userFound.userRoles);
  return;
};

export const assignUserRoles = async (req: Request, res: Response) => {
  logger.info({ message: "Asignando roles al usuario", action: "assignUserRoles" });

  const userId = Number(req.params.id);
  const { roleIds } = req.body;

  if (!roleIds || roleIds.length === 0) {
    logger.error({
      message: "No se han proporcionado roles para asignar al usuario.",
      action: "assignUserRoles"
    });
    getBadRequest(res, `No se han proporcionado roles para asignar al usuario.`);
    return;
  }

  try {
    const userRepository = myDataSource.getRepository(User);
    const roleRepository = myDataSource.getRepository(Role);
    const userRolesRepository = myDataSource.getRepository(UserRoles);

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      logger.error({ message: "Usuario no encontrado", action: "assignUserRoles" });
      getBadRequest(res, "Usuario no encontrado.");
      return;
    }

    // 1. Borrar relaciones anteriores
    await userRolesRepository.delete({ user: { id: userId } });

    // 2. Buscar roles válidos
    // Usamos In para buscar todos los roles que coincidan con los IDs proporcionados
    const roles = await roleRepository.find({
      where: { id: In(roleIds) },
      select: { id: true, name: true, description: true, isActive: true }
    });

    // 3. Crear nuevas relaciones UserRoles
    const nuevasRelaciones = roles.map((rol) => {
      const userRole = new UserRoles();
      userRole.user = user;
      userRole.role = rol;
      return userRole;
    });

    // 4. Guardar nuevas relaciones
    await userRolesRepository.save(nuevasRelaciones);

    logger.info({
      message: `Roles actualizados exitosamente`,
      action: "assignUserRoles"
    });

    res.status(StatusCodes.OK).json({
      message: "Roles asignados correctamente al usuario",
      data: {
        userId,
        roles: roleIds
      }
    });
  } catch (error) {
    logger.error({
      message: "Error al asignar roles",
      action: "assignUserRoles",
      error
    });
    getInternalServerError(res, `Ocurrió un error: ${error}`);
    return;
  }
};

export const removeUserRole = async (req: Request, res: Response) => {
  logger.info({ message: "Eliminando rol de usuario", action: "deleteUserRole" });

  const userId = Number(req.params.id);
  const roleId = Number(req.params.roleId);

  try {
    const userRolesRepository = myDataSource.getRepository(UserRoles);

    // Buscar la relación exacta
    const relacion = await userRolesRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId }
      },
      relations: ["user", "role"]
    });

    if (!relacion) {
      logger.warn({
        message: `No existe la relación entre el usuario ${userId} y el rol ${roleId}`,
        action: "deleteUserRole"
      });
      getNotFound(res, "Relación usuario-rol no encontrada");
      return;
    }

    await userRolesRepository.remove(relacion);

    logger.info({
      message: `Rol ${roleId} eliminado exitosamente del usuario ${userId}`,
      action: "deleteUserRole"
    });

    res.status(StatusCodes.OK).json({
      message: "Rol eliminado del usuario"
    });
    return;
  } catch (error) {
    logger.error({
      message: "Error al eliminar rol del usuario",
      action: "deleteUserRole",
      error
    });
    getInternalServerError(res, `Error al eliminar el rol del usuario: ${error}`);
    return;
  }
};
