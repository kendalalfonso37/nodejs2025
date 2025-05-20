export interface PermisoCreateRequest {
  name: string;
  description: string;
  isActive?: boolean;
  groupId: number;
}
