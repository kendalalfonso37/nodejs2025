import { Request, Response } from "express";
import logger from "../utils/logger";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { StatusCodes } from "http-status-codes";
import { Permission } from "../entity/Permission";
import { PermisoCreateRequest } from "../requests/permisoCreateRequest";
import { PermisoUpdateRequest } from "../requests/permisoUpdateRequest";
import { Group } from "../entity/Group";

export const getPermisos = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo permisos", action: "getPermisos" });

  try {
    const { page, records, sortBy, sortOrder, search, filters } = req.query;

    const permisoRepository = myDataSource.getRepository(Permission);

    const paginationParams: PaginationParams<Permission> = {
      page: Number(page) || undefined,
      records: Number(records) || undefined,
      sortBy: sortBy as keyof Permission, // Acepta cualquier campo de Permission
      sortOrder: sortOrder as "ASC" | "DESC",
      search: search as string,
      filters: filters ? JSON.parse(filters as string) : undefined
    };

    logger.info({
      message: "Filtros usados para la busqueda",
      action: "getPermisos",
      paginationParams
    });

    const permisos = await getPaginatedData(permisoRepository, paginationParams);

    res.status(StatusCodes.OK).json(permisos);
  } catch (error) {
    logger.error({ message: "Error al obtener permisos paginados:", action: "getPermisos", error });
    getInternalServerError(res, `Error al obtener la lista de permisos.`);
    return;
  }
};

export const getPermisoDetails = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo detalles del permiso", action: "getPermisoDetails" });

  const id = req.params.id;

  try {
    const permisoRepository = myDataSource.getRepository(Permission);

    const permisoFound = await permisoRepository.findOneByOrFail({
      id: Number(id)
    });

    res.status(StatusCodes.OK).json(permisoFound);
  } catch (error) {
    logger.error({ message: "Permiso no encontrado", action: "getPermisoDetails", error });
    getNotFound(res, `Permiso no encontrado`);
    return;
  }
};

export const createPermiso = async (req: Request, res: Response) => {
  logger.info({ message: "Registrando nuevo permiso.", action: "createPermiso" });

  const permisoCreateRequest: PermisoCreateRequest = req.body;

  try {
    const permisoRepository = myDataSource.getRepository(Permission);

    // Validar si el grupo existe.
    const grupoRepository = myDataSource.getRepository(Group);
    const grupoFound = await grupoRepository.findOneBy({
      id: Number(permisoCreateRequest.groupId)
    });
    if (!grupoFound) {
      logger.error({ message: "Grupo no encontrado", action: "createPermiso" });
      getBadRequest(res, `Grupo no encontrado.`);
      return;
    }

    const newPermiso = permisoRepository.create({
      name: permisoCreateRequest.name,
      description: permisoCreateRequest.description,
      isActive: permisoCreateRequest.isActive,
      group: grupoFound
    });

    await permisoRepository.save(newPermiso);
    logger.info({ message: `El permiso ha sido creado exitosamente.`, action: "createPermiso" });
    res.status(StatusCodes.OK).json(newPermiso);
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al crear el permiso",
      action: "createPermiso",
      error
    });
    getInternalServerError(res, `Ocurrio un error al crear el permiso: ${error}`);
    return;
  }
};

export const updatePermiso = async (req: Request, res: Response) => {
  logger.info({ message: `Obteniendo detalles del permiso.`, action: "updatePermiso" });

  const id = req.params.id;
  const permisoUpdateRequest: PermisoUpdateRequest = req.body;

  const permisoRepository = myDataSource.getRepository(Permission);

  const permisoFound = await permisoRepository.findOne({ where: { id: Number(id) } });

  if (!permisoFound) {
    logger.error({ message: `Permiso no encontrado`, action: "updatePermiso" });
    getBadRequest(res, `Permiso no encontrado.`);
    return;
  }

  // Validar si el grupo existe.
  const grupoRepository = myDataSource.getRepository(Group);
  const grupoFound = await grupoRepository.findOneBy({
    id: Number(permisoUpdateRequest.groupId)
  });
  if (!grupoFound) {
    logger.error({ message: "Grupo no encontrado", action: "updatePermiso" });
    getBadRequest(res, `Grupo no encontrado.`);
    return;
  }

  try {
    permisoFound.name = permisoUpdateRequest.name ? permisoUpdateRequest.name : permisoFound.name;
    permisoFound.description = permisoUpdateRequest.description
      ? permisoUpdateRequest.description
      : permisoFound.description;
    permisoFound.isActive = permisoUpdateRequest.isActive;
    permisoFound.updatedAt = new Date();
    permisoFound.group = grupoFound;

    permisoRepository.save(permisoFound);
    logger.info({
      message: `El permiso ha sido actualizado exitosamente.`,
      action: "updatePermiso"
    });
    res
      .status(StatusCodes.OK)
      .json({ message: `El permiso ha sido actualizado exitosamente.`, data: permisoFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al actualizar el permiso",
      action: "updatePermiso",
      error
    });
    getInternalServerError(res, `Ocurrio un error al actualizar el permiso: ${error}`);
    return;
  }
};

export const deletePermiso = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del permiso", action: "deletePermiso" });

  const id = req.params.id;
  const permisoRepository = myDataSource.getRepository(Permission);
  const permisoFound = await permisoRepository.findOne({ where: { id: Number(id) } });

  if (!permisoFound) {
    logger.error({ message: `Permiso no encontrado`, action: "deletePermiso" });
    getBadRequest(res, `Permiso no encontrado.`);
    return;
  }

  try {
    permisoFound.deletedAt = new Date();
    permisoRepository.save(permisoFound);

    logger.info({ message: `El permiso ha sido eliminado exitosamente.`, action: "deletePermiso" });
    res
      .status(StatusCodes.OK)
      .json({ message: "El permiso ha sido eliminado exitosamente.", data: permisoFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al eliminar el permiso",
      action: "deletePermiso",
      error
    });
    getInternalServerError(res, `Ocurrio un error al eliminar el permiso: ${error}`);
    return;
  }
};

export const getAllActivePermissions = async (req: Request, res: Response) => {
  logger.info({
    message: "Obteniendo todos los permisos activos",
    action: "getAllActivePermissions"
  });

  try {
    const permisoRepository = myDataSource.getRepository(Permission);
    const permisos = await permisoRepository.find({
      where: { isActive: true },
      order: { name: "ASC" } // opcional
    });

    res.status(StatusCodes.OK).json({ data: permisos });
  } catch (error) {
    logger.error({
      message: "Error al obtener todos los permisos activos",
      action: "getAllActivePermissions",
      error
    });
    getInternalServerError(res, "Error al obtener permisos activos.");
  }
};
