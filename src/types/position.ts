import { BaseSearchDto } from './common';
import { Department, Staff } from './department';

// Entity type
export interface Position {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isMain: boolean;
  department: Department | null;
  staff: Staff | null;
  voided: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Search DTO
export interface SearchPositionDto extends BaseSearchDto {
  departmentId?: string;
  staffId?: string;
  isMain?: boolean;
  code?: string;
  name?: string;
}

// Default values
export const defaultSearchPositionDto: SearchPositionDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};

export interface PositionFormData {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  departmentId?: string;
  staffId?: string;
  isMain?: boolean;
}
