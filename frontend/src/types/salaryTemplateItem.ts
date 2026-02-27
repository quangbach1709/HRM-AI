import { BaseSearchDto } from './common';
import { SalaryTemplate } from './salaryTemplate';

// Copied from Backend or assumed constants
export enum SalaryItemType {
    FIXED = 1,          // Số tiền cố định
    USING_FORMULA = 2,  // Dùng công thức
    USER_INPUT = 3,     // Hệ thống lấy dự liệu
}

export const SalaryItemTypeLabel: Record<number, string> = {
    [SalaryItemType.FIXED]: 'Cố định',
    [SalaryItemType.USING_FORMULA]: 'Công thức',
    [SalaryItemType.USER_INPUT]: 'Hệ thống lấy dự liệu',
};

export const SalaryItemTypeColor: Record<number, string> = {
    [SalaryItemType.FIXED]: 'default',
    [SalaryItemType.USING_FORMULA]: 'warning',
    [SalaryItemType.USER_INPUT]: 'info',
};

export interface SalaryTemplateItem {
    id: string;
    code: string;
    name: string;
    displayOrder: number;
    salaryTemplate?: SalaryTemplate;
    salaryItemType: number;
    defaultAmount?: number;
    formula?: string;

    // Audit
    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface SalaryTemplateItemFormData {
    id?: string;
    code?: string;
    name?: string;
    displayOrder: number;
    salaryTemplateId: string; // Used for Select, mapped to entity relation
    salaryItemType: number;
    defaultAmount?: number;
    formula?: string;
}

export interface SearchSalaryTemplateItemDto extends BaseSearchDto {
    code?: string;
    name?: string;
    salaryTemplateId?: string;
    salaryItemType?: number;
}

export const defaultSearchSalaryTemplateItemDto: SearchSalaryTemplateItemDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'displayOrder',
    sortDirection: 'ASC',
    voided: false,
};
