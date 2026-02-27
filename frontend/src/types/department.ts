// Department types for frontend

export interface Department {
    id: string;
    code: string;
    name: string;
    description: string | null;
    parentId: string | null;
    parent?: Department | null;
    subRows?: Department[];
    positionManager?: Position | null;
    positions?: Position[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Position {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isMain: boolean;
    staff?: Staff | null;
}

export interface Staff {
    id: string;
    staffCode: string;
    displayName: string;
}

export interface DepartmentFormData {
    id?: string;
    code?: string;
    name: string;
    description?: string;
    parentId?: string | null;
}

// Sort direction
export type SortDirection = 'ASC' | 'DESC';

// Base SearchDto (tương ứng backend)
export interface SearchDto {
    id?: string;
    ownerId?: string;
    pageIndex?: number;
    pageSize?: number;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    voided?: boolean;
    orderBy?: boolean;
    roleId?: string;
    parentId?: string;
    exportExcel?: boolean;
}

// Extended SearchDepartmentDto
export interface SearchDepartmentDto extends SearchDto {
    sortBy?: string;
    sortDirection?: SortDirection;
    code?: string;
    name?: string;
}

// Default values
export const defaultSearchDepartmentDto: SearchDepartmentDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};

// PageResponse từ backend
export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}
