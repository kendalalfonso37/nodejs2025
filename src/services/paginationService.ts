import { FindOptionsWhere, Like, ObjectLiteral, Repository } from "typeorm";

export interface PaginationParams<T> {
  page?: number;
  records?: number;
  sortBy?: keyof T;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  filters?: FindOptionsWhere<T>;
}

export const getPaginatedData = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  params: PaginationParams<T>,
  excludeFields: (keyof T)[] = []
) => {
  const { page = 1, records = 10, sortBy, sortOrder = "ASC", search, filters = {} } = params;

  const skip = (page - 1) * records;
  const take = records;

  const where: FindOptionsWhere<T> = { ...filters };

  // Aplicar búsqueda si existe (asumiendo que hay un campo 'name')
  if (search && "name" in where) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (where as any).name = Like(`%${search}%`);
  }

  // Consultar registros con paginación
  const [data, total] = await repository.findAndCount({
    where,
    take,
    skip,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: sortBy ? ({ [sortBy]: sortOrder } as any) : undefined // Permite ordenar por cualquier campo
  });

  // Eliminar campos sensibles
  const filteredData = data.map((item) => {
    const itemCopy = { ...item };
    excludeFields.forEach((field) => delete itemCopy[field]);
    return itemCopy;
  });

  return {
    totalRecords: total,
    totalPages: Math.ceil(total / records),
    currentPage: page,
    recordsPerPage: records,
    data: filteredData
  };
};
