// src/types/common.ts

// Search DTO cơ bản (tương ứng SearchDto backend)
export interface SearchDto {
    id?: string;
    ownerId?: string;
    pageIndex?: number;
    pageSize?: number;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    voided?: boolean;
    orderBy?: boolean;  // true = ASC, false = DESC
    roleId?: string;
    parentId?: string;
    exportExcel?: boolean;
}

// Sort direction
export type SortDirection = 'ASC' | 'DESC';

// Base search với sort mở rộng
export interface BaseSearchDto extends SearchDto {
    sortBy?: string;
    sortDirection?: SortDirection;
}
