import { BaseSearchDto } from './common';
import { Role } from './role';
import { Person } from './person';

export interface User {
    id: string;
    username: string;
    email: string;
    person?: Person;
    roles?: Role[]; // UserDto maps UserRole to RoleDto
    lastLoginTime?: string;
    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserFormData {
    id?: string;
    username: string;
    password?: string;
    confirmPassword?: string;
    email: string;
    person?: { id: string }; // For linking to person
    roles?: { id: string }[]; // For linking roles
}

export interface SearchUserDto extends BaseSearchDto {
    username?: string;
    email?: string;
    roleId?: string;
}

export const defaultSearchUserDto: SearchUserDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
