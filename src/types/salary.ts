// SalaryTemplateItem Types
export interface SalaryTemplateItem {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  salaryTemplateId: string;
  salaryItemType: number; // 0: Giá trị cố định, 1: Công thức, 2: Hệ thống
  defaultAmount?: number;
  formula?: string;
  salaryTemplate?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryTemplateItemFormData {
  id?: string;
  name: string;
  code: string;
  displayOrder: number;
  salaryTemplateId: string;
  salaryItemType: number;
  defaultAmount?: number;
  formula?: string;
}

export interface SearchSalaryTemplateItemDto {
  keyword?: string;
  salaryTemplateId?: string;
  salaryItemType?: number;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchSalaryTemplateItemDto: SearchSalaryTemplateItemDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'displayOrder',
  sortDirection: 'ASC',
};

export const salaryItemTypeOptions = [
  { value: 0, label: 'Giá trị cố định' },
  { value: 1, label: 'Công thức' },
  { value: 2, label: 'Hệ thống' },
];

// SalaryResult Types
export interface SalaryResult {
  id: string;
  salaryPeriodId: string;
  salaryTemplateId: string;
  name: string;
  salaryPeriod?: {
    id: string;
    name: string;
  };
  salaryTemplate?: {
    id: string;
    name: string;
  };
  items?: SalaryResultItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryResultFormData {
  id?: string;
  salaryPeriodId: string;
  salaryTemplateId: string;
  name: string;
}

export interface SearchSalaryResultDto {
  keyword?: string;
  salaryPeriodId?: string;
  salaryTemplateId?: string;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchSalaryResultDto: SearchSalaryResultDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

// SalaryResultItem Types
export interface SalaryResultItem {
  id: string;
  salaryResultId: string;
  staffId: string;
  staff?: {
    id: string;
    staffCode: string;
    displayName: string;
  };
  details?: SalaryResultItemDetail[];
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// SalaryResultItemDetail Types
export interface SalaryResultItemDetail {
  id: string;
  salaryResultItemId: string;
  salaryTemplateItemId: string;
  value: number;
  salaryTemplateItem?: SalaryTemplateItem;
}
