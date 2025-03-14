export interface UserUpdateRequest {
  username: string;
  email: string;
  password?: string;
  isActive?: boolean;
}
