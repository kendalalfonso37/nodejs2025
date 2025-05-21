import { Request, Response } from "express";
import logger from "../utils/logger";
import { myDataSource } from "../app-data-source";
import { getBadRequest, getInternalServerError, getNotFound } from "../helpers/httpErrorHelper";
import { getPaginatedData, PaginationParams } from "../services/paginationService";
import { StatusCodes } from "http-status-codes";
import { Role } from "../entity/Role";
import { RoleCreateRequest } from "../requests/roleCreateRequest";
import { RoleUpdateRequest } from "../requests/roleUpdateRequest";
import { Permission } from "../entity/Permission";
import { RolePermissions } from "../entity/RolePermissions";
import { In } from "typeorm";

export const getRoles = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo roles", action: "getRoles" });

  try {
    const { page, records, sortBy, sortOrder, search, filters } = req.query;

    const roleRepository = myDataSource.getRepository(Role);

    const paginationParams: PaginationParams<Role> = {
      page: Number(page) || undefined,
      records: Number(records) || undefined,
      sortBy: sortBy as keyof Role, // Acepta cualquier campo de Role
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
    logger.error({ message: "Error al obtener roles paginados:", action: "getRoles", error });
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
    logger.error({ message: "Rol no encontrado", action: "getRoleDetails", error });
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
      description: roleCreateRequest.description,
      isActive: roleCreateRequest.isActive
    });

    await roleRepository.save(newRole);
    logger.info({ message: `El rol ha sido creado exitosamente.`, action: "createRole" });
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

export const getRolePermissions = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo permisos asociados al rol", action: "getRolePermissions" });

  const id = req.params.id;
  const roleRepository = myDataSource.getRepository(Role);

  const roleFound = await roleRepository.findOne({
    where: { id: Number(id) },
    relations: { rolePermissions: { permission: true } }
  });

  if (!roleFound) {
    logger.error({ message: "Rol no encontrado", action: "getRolePermissions" });
    getNotFound(res, "Rol no encontrado");
    return;
  }

  res.json(roleFound.rolePermissions);
};

export const assignRolePermissions = async (req: Request, res: Response) => {
  logger.info({ message: "Asignando permisos al rol", action: "assignRolePermissions" });
  const roleId = Number(req.params.id);

  const { permissionIds } = req.body;

  if (!permissionIds || permissionIds.length === 0) {
    logger.error({
      message: "No se han proporcionado permisos para asignar al rol.",
      action: "assignRolePermissions"
    });
    getBadRequest(res, "No se han proporcionado permisos para asignar al rol.");
    return;
  }

  try {
    const roleRepository = myDataSource.getRepository(Role);
    const permissionRepository = myDataSource.getRepository(Permission);
    const rolePermissionRepository = myDataSource.getRepository(RolePermissions);

    const role = await roleRepository.findOneBy({ id: roleId });
    if (!role) {
      logger.error({ message: "rol no encontrado", action: "assignRolePermissions" });
      getBadRequest(res, "Rol no encontrado.");
      return;
    }

    // 1. Borrar relaciones anteriores
    await rolePermissionRepository.delete({ role: { id: roleId } });

    // 2. Buscar roles válidos
    // Usamos In para buscar todos los roles que coincidan con los IDs proporcionados
    const permissions = await permissionRepository.find({
      where: { id: In(permissionIds) },
      select: { id: true, name: true, description: true, isActive: true }
    });

    // 3 Crear nuevas relaciones RolePermission
    const nuevasRelaciones = permissions.map((permission) => {
      const rolePermission = new RolePermissions();
      rolePermission.permission = permission;
      rolePermission.role = role;
      return rolePermission;
    });

    // 4. Guardar nuevas relaciones
    await rolePermissionRepository.save(nuevasRelaciones);

    logger.info({
      message: "Permisos actualizados exitosamente.",
      action: "assignRolePermissions"
    });

    res.status(StatusCodes.OK).json({
      message: "Permisos asignados correctamente al rol.",
      data: {
        roleId,
        permissions: permissionIds
      }
    });
  } catch (error) {
    logger.error({
      message: "Error al asignar permisos",
      action: "assignRolePermissions",
      error
    });
    getInternalServerError(res, `Ocurrió un error: ${error}`);
    return;
  }
};

export const removeRolePermission = async (req: Request, res: Response) => {
  logger.info({ message: "Eliminando Permiso al Rol.", action: "removeRolePermission" });

  const roleId = Number(req.params.id);
  const permissionId = Number(req.params.permissionId);

  try {
    const rolePermissionRepository = myDataSource.getRepository(RolePermissions);

    // Buscar la relacion exacta
    const relacion = await rolePermissionRepository.findOne({
      where: {
        role: { id: roleId },
        permission: { id: permissionId }
      },
      relations: ["role", "permission"]
    });

    if (!relacion) {
      logger.warn({
        message: `No existe la relación entre el role ${roleId} y el permiso ${permissionId}`,
        action: "removeRolePermission"
      });
      getNotFound(res, "Relación rol-permiso no encontrada");
      return;
    }

    await rolePermissionRepository.remove(relacion);

    logger.info({
      message: `Permiso ${permissionId} eliminado exitosamente del rol ${roleId}`,
      action: "removeRolePermission"
    });

    res.status(StatusCodes.OK).json({ message: "Permiso eliminado del rol" });
    return;
  } catch (error) {
    logger.error({
      message: "Error al eliminar permiso del rol",
      action: "removeRolePermission",
      error
    });
    getInternalServerError(res, `Error al eliminar el permiso del rol: ${error}`);
    return;
  }
};

export const getAllActiveRoles = async (req: Request, res: Response) => {
  logger.info({ message: "Obteniendo todos los roles activos", action: "getAllActiveRoles" });

  try {
    const roleRepository = myDataSource.getRepository(Role);
    const roles = await roleRepository.find({
      where: { isActive: true },
      order: { name: "ASC" } // opcional
    });

    res.status(StatusCodes.OK).json({ data: roles });
  } catch (error) {
    logger.error({
      message: "Error al obtener todos los roles activos",
      action: "getAllActiveRoles",
      error
    });
    getInternalServerError(res, "Error al obtener roles activos.");
  }
};
