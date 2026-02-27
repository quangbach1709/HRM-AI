import { BaseSearchDto } from './common';

export interface SalaryResultItem {
    id: string;

    // Relations
    salaryResult?: {
        id: string;
        name: string;
    };
    staff?: {
        id: string;
        staffCode: string;
        displayName: string;
    };
    salaryResultItemDetails?: SalaryResultItemDetail[];

    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryResultItemDetail {
    id: string;
    value?: number;
    salaryTemplateItem?: {
        id: string;
        name: string;
        displayOrder?: number;
    };
}

export interface SalaryResultItemFormData {
    id?: string;
    salaryResultId: string;
    staffId: string;
}

export interface SearchSalaryResultItemDto extends BaseSearchDto {
    salaryResultId?: string;
    staffId?: string;
    staffCode?: string;
    staffName?: string;
}

export const defaultSearchSalaryResultItemDto: SearchSalaryResultItemDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
