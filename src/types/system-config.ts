// SystemConfig Types

export interface SystemConfig {
    id: string;
    code?: string;
    name?: string;
    description?: string;
    configKey?: string;
    configValue?: string;
    numberOfZero?: number;
    note?: string;
    configType?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface SystemConfigFormData {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    configKey?: string;
    configValue?: string;
    numberOfZero?: number;
    note?: string;
    configType?: number;
}

export interface SearchSystemConfigDto {
    keyword?: string;
    configKey?: string;
    configType?: number;
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchSystemConfigDto: SearchSystemConfigDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
};

// Config Type options for dropdown
export const CONFIG_TYPE_OPTIONS = [
    { value: 1, label: 'Cấu hình chung' },
    { value: 2, label: 'Cấu hình email' },
    { value: 3, label: 'Cấu hình hệ thống' },
    { value: 4, label: 'Cấu hình khác' },
];

export const getConfigTypeName = (value?: number): string => {
    const option = CONFIG_TYPE_OPTIONS.find(opt => opt.value === value);
    return option?.label || 'Không xác định';
};
