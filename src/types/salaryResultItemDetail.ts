import { BaseSearchDto } from './common';

export interface SalaryResultItemDetail {
    id: string;

    // Relations
    salaryResultItem?: {
        id: string;
        salaryResult?: {
            id: string;
            name: string;
        };
        staff?: {
            id: string;
            staffCode: string;
            displayName: string;
        };
    };
    salaryTemplateItem?: {
        id: string;
        name: string;
        code?: string;
        displayOrder?: number;
    };

    // Fields
    value?: number;

    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryResultItemDetailFormData {
    id?: string;
    salaryResultItemId: string;
    salaryTemplateItemId: string;
    value: number;
}

export interface SearchSalaryResultItemDetailDto extends BaseSearchDto {
    salaryResultItemId?: string;
    salaryTemplateItemId?: string;
    minValue?: number;
    maxValue?: number;
}

export const defaultSearchSalaryResultItemDetailDto: SearchSalaryResultItemDetailDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
