import { Request, Response } from "express";
import logger from "../utils/logger";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { StatusCodes } from "http-status-codes";
import { Role } from "../entity/Role";
import { RoleCreateRequest } from "../requests/roleCreateRequest";
import { RoleUpdateRequest } from "../requests/roleUpdateRequest";

export const getRoles = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo roles", action: "getRoles" });

  try {
    const { page, records, sortBy, sortOrder, search, filters } = req.query;

    const roleRepository = myDataSource.getRepository(Role);

    const paginationParams: PaginationParams<Role> = {
      page: Number(page) || undefined,
      records: Number(records) || undefined,
      sortBy: sortBy as keyof Role, // Acepta cualquier campo de User
      sortOrder: sortOrder as "ASC" | "DESC",
      search: search as string,
      filters: filters ? JSON.parse(filters as string) : undefined
    };

    logger.info({
      message: "Filtros usados para la busqueda",
      action: "getRoles",
      paginationParams
    });

    const roles = await getPaginatedData(roleRepository, paginationParams);

    res.status(StatusCodes.OK).json(roles);
  } catch (error) {
    logger.error("Error al obtener roles paginados:", error);
    getInternalServerError(res, `Error al obtener la lista de roles.`);
    return;
  }
};

export const getRoleDetails = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo detalles del rol", action: "getRoleDetails" });

  const id = req.params.id;

  try {
    const roleRepository = myDataSource.getRepository(Role);

    const roleFound = await roleRepository.findOneByOrFail({
      id: Number(id)
    });

    res.status(StatusCodes.OK).json(roleFound);
  } catch (error) {
    logger.error("Rol no encontrado", error);
    getNotFound(res, `Rol no encontrado`);
    return;
  }
};

export const createRole = async (req: Request, res: Response) => {
  logger.info({ message: "Registrando nuevo rol.", action: "createRole" });

  const roleCreateRequest: RoleCreateRequest = req.body;

  try {
    const roleRepository = myDataSource.getRepository(Role);

    const newRole = roleRepository.create({
      name: roleCreateRequest.name,
      description: roleCreateRequest.description
    });

    await roleRepository.save(newRole);
    logger.info({ message: `El usuario ha sido creado exitosamente.`, action: "createRole" });
    res.status(StatusCodes.OK).json(newRole);
  } catch (error) {
    logger.error({ message: "Ocurrio un error al crear el rol", action: "createRole", error });
    getInternalServerError(res, `Ocurrio un error al crear el rol: ${error}`);
    return;
  }
};

export const updateRole = async (req: Request, res: Response) => {
  logger.info({ message: `Obteniendo detalles del rol.`, action: "updateRole" });

  const id = req.params.id;
  const roleUpdateRequest: RoleUpdateRequest = req.body;

  const roleRepository = myDataSource.getRepository(Role);

  const roleFound = await roleRepository.findOne({ where: { id: Number(id) } });

  if (!roleFound) {
    logger.error({ message: `Rol no encontrado`, action: "updateRole" });
    getBadRequest(res, `Rol no encontrado.`);
    return;
  }

  try {
    roleFound.name = roleUpdateRequest.name ? roleUpdateRequest.name : roleFound.name;
    roleFound.description = roleUpdateRequest.description
      ? roleUpdateRequest.description
      : roleFound.description;
    roleFound.isActive = roleUpdateRequest.isActive;
    roleFound.updatedAt = new Date();

    roleRepository.save(roleFound);
    logger.info({ message: `El rol ha sido actualizado exitosamente.`, action: "updateRole" });
    res
      .status(StatusCodes.OK)
      .json({ message: `El rol ha sido actualizado exitosamente.`, data: roleFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al actualizar el rol",
      action: "updateRole",
      error
    });
    getInternalServerError(res, `Ocurrio un error al actualizar el rol: ${error}`);
    return;
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del rol", action: "deleteRole" });

  const id = req.params.id;
  const roleRepository = myDataSource.getRepository(Role);
  const roleFound = await roleRepository.findOne({ where: { id: Number(id) } });

  if (!roleFound) {
    logger.error({ message: `Rol no encontrado`, action: "deleteRole" });
    getBadRequest(res, `Rol no encontrado.`);
    return;
  }

  try {
    roleFound.deletedAt = new Date();
    roleRepository.save(roleFound);

    logger.info({ message: `El rol ha sido eliminado exitosamente.`, action: "deleteRole" });
    res
      .status(StatusCodes.OK)
      .json({ message: "El rol ha sido eliminado exitosamente.", data: roleFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al eliminar el rol",
      action: "deleteRole",
      error
    });
    getInternalServerError(res, `Ocurrio un error al eliminar el rol: ${error}`);
    return;
  }
};
