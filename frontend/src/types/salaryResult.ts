import { BaseSearchDto } from './common';

export interface SalaryResult {
    id: string;
    name: string;
    salaryPeriodId?: string;
    salaryTemplateId?: string;

    // Relations
    salaryPeriod?: { id: string; name: string };
    salaryTemplate?: { id: string; name: string };

    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SalaryResultFormData {
    id?: string;
    name: string;
    salaryPeriodId: string;
    salaryTemplateId: string;
}

export interface SearchSalaryResultDto extends BaseSearchDto {
    name?: string;
    salaryPeriodId?: string;
    salaryTemplateId?: string;
}

export const defaultSearchSalaryResultDto: SearchSalaryResultDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
