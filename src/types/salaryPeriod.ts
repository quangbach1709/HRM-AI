import { BaseSearchDto } from './common';

export enum SalaryPeriodStatus {
    DRAFT = 1,      // Nháp
    APPROVED = 2,   // Đã duyệt
    FINALIZED = 3   // Đã chốt
}

export const SalaryPeriodStatusLabel: Record<number, string> = {
    [SalaryPeriodStatus.DRAFT]: 'Nháp',
    [SalaryPeriodStatus.APPROVED]: 'Đã duyệt',
    [SalaryPeriodStatus.FINALIZED]: 'Đã chốt',
};

export const SalaryPeriodStatusColor: Record<number, string> = {
    [SalaryPeriodStatus.DRAFT]: 'default',
    [SalaryPeriodStatus.APPROVED]: 'primary',
    [SalaryPeriodStatus.FINALIZED]: 'success',
};

export interface SalaryPeriod {
    id: string;
    code: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    salaryPeriodStatus: number;
    estimatedWorkingDays?: number;

    // Audit
    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface SalaryPeriodFormData {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    startDate: Date | string;
    endDate: Date | string;
    salaryPeriodStatus?: number;
    estimatedWorkingDays?: number;
}

export interface SearchSalaryPeriodDto extends BaseSearchDto {
    code?: string;
    name?: string;
    salaryPeriodStatus?: number;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
}

export const defaultSearchSalaryPeriodDto: SearchSalaryPeriodDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
