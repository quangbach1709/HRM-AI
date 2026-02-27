import { BaseSearchDto } from './common';

export interface SalaryTemplate {
    id: string;
    code: string;
    name: string;
    description?: string;
    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface SalaryTemplateFormData {
    id?: string;
    code: string;
    name: string;
    description?: string;
}

export interface SearchSalaryTemplateDto extends BaseSearchDto {
    code?: string;
    name?: string;
    description?: string;
}

export const defaultSearchSalaryTemplateDto: SearchSalaryTemplateDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
