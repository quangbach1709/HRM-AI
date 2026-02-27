// Role Types
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoleFormData {
  id?: string;
  name: string;
  description?: string;
}

export interface SearchRoleDto {
  keyword?: string;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchRoleDto: SearchRoleDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'name',
  sortDirection: 'ASC',
};

// UserRole Types
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleFormData {
  id?: string;
  userId: string;
  roleId: string;
}

export interface SearchUserRoleDto {
  keyword?: string;
  userId?: string;
  roleId?: string;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchUserRoleDto: SearchUserRoleDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};
