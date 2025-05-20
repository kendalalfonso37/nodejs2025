import { Request, Response } from "express";
import logger from "../utils/logger";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { StatusCodes } from "http-status-codes";
import { Group } from "../entity/Group";
import { GroupCreateRequest } from "../requests/grupoCreateRequest";
import { GroupUpdateRequest } from "../requests/grupoUpdateRequest";

export const getGroups = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo grupos", action: "getGroups" });

  try {
    const { page, records, sortBy, sortOrder, search, filters } = req.query;

    const groupRepository = myDataSource.getRepository(Group);

    const paginationParams: PaginationParams<Group> = {
      page: Number(page) || undefined,
      records: Number(records) || undefined,
      sortBy: sortBy as keyof Group, // Acepta cualquier campo de Group
      sortOrder: sortOrder as "ASC" | "DESC",
      search: search as string,
      filters: filters ? JSON.parse(filters as string) : undefined
    };

    logger.info({
      message: "Filtros usados para la busqueda",
      action: "getGroups",
      paginationParams
    });

    const groups = await getPaginatedData(groupRepository, paginationParams);

    res.status(StatusCodes.OK).json(groups);
  } catch (error) {
    logger.error({ message: "Error al obtener grupos paginados:", action: "getGroups", error });
    getInternalServerError(res, `Error al obtener la lista de grupos.`);
    return;
  }
};

export const getGroupDetails = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo detalles del grupo", action: "getGroupDetails" });

  const id = req.params.id;

  try {
    const groupRepository = myDataSource.getRepository(Group);

    const groupFound = await groupRepository.findOneByOrFail({
      id: Number(id)
    });

    res.status(StatusCodes.OK).json(groupFound);
  } catch (error) {
    logger.error({ message: "Grupo no encontrado", action: "getGroupDetails", error });
    getNotFound(res, `Grupo no encontrado`);
    return;
  }
};

export const createGroup = async (req: Request, res: Response) => {
  logger.info({ message: "Registrando nuevo grupo.", action: "createGroup" });

  const groupCreateRequest: GroupCreateRequest = req.body;

  try {
    const groupRepository = myDataSource.getRepository(Group);

    const newGroup = groupRepository.create({
      name: groupCreateRequest.name,
      description: groupCreateRequest.description,
      isActive: groupCreateRequest.isActive
    });

    await groupRepository.save(newGroup);
    logger.info({ message: `El grupo ha sido creado exitosamente.`, action: "createGroup" });
    res.status(StatusCodes.OK).json(newGroup);
  } catch (error) {
    logger.error({ message: "Ocurrio un error al crear el grupo", action: "createGroup", error });
    getInternalServerError(res, `Ocurrio un error al crear el grupo: ${error}`);
    return;
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  logger.info({ message: `Obteniendo detalles del grupo.`, action: "updateGroup" });

  const id = req.params.id;
  const groupUpdateRequest: GroupUpdateRequest = req.body;

  const groupRepository = myDataSource.getRepository(Group);

  const groupFound = await groupRepository.findOne({ where: { id: Number(id) } });

  if (!groupFound) {
    logger.error({ message: `Grupo no encontrado`, action: "updateGroup" });
    getBadRequest(res, `Grupo no encontrado.`);
    return;
  }

  try {
    groupFound.name = groupUpdateRequest.name ? groupUpdateRequest.name : groupFound.name;
    groupFound.description = groupUpdateRequest.description
      ? groupUpdateRequest.description
      : groupFound.description;
    groupFound.isActive = groupUpdateRequest.isActive;
    groupFound.updatedAt = new Date();

    groupRepository.save(groupFound);
    logger.info({ message: `El grupo ha sido actualizado exitosamente.`, action: "updateGroup" });
    res
      .status(StatusCodes.OK)
      .json({ message: `El grupo ha sido actualizado exitosamente.`, data: groupFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al actualizar el grupo",
      action: "updateGroup",
      error
    });
    getInternalServerError(res, `Ocurrio un error al actualizar el grupo: ${error}`);
    return;
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo Detalles del grupo", action: "deleteGroup" });

  const id = req.params.id;
  const groupRepository = myDataSource.getRepository(Group);
  const groupFound = await groupRepository.findOne({ where: { id: Number(id) } });

  if (!groupFound) {
    logger.error({ message: `Grupo no encontrado`, action: "deleteGroup" });
    getBadRequest(res, `Grupo no encontrado.`);
    return;
  }

  try {
    groupFound.deletedAt = new Date();
    groupRepository.save(groupFound);

    logger.info({ message: `El grupo ha sido eliminado exitosamente.`, action: "deleteGroup" });
    res
      .status(StatusCodes.OK)
      .json({ message: "El grupo ha sido eliminado exitosamente.", data: groupFound });
  } catch (error) {
    logger.error({
      message: "Ocurrio un error al eliminar el grupo",
      action: "deleteGroup",
      error
    });
    getInternalServerError(res, `Ocurrio un error al eliminar el grupo: ${error}`);
    return;
  }
};
