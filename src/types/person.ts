import { BaseSearchDto } from './common';

// Person Interface
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  birthDate?: string; // Note: Backend Date is usually serialized to string
  birthPlace?: string;
  gender: number; // 0: Nam, 1: Nữ, 2: Khác
  phoneNumber?: string;
  idNumber?: string;
  idNumberIssueBy?: string;
  idNumberIssueDate?: string;
  email?: string;
  maritalStatus?: number; // 0: Độc thân, 1: Đã kết hôn, 2: Ly hôn
  taxCode?: string;
  educationLevel?: number;
  height?: number;
  weight?: number;

  // Audit fields
  voided?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // Complex types if needed, though usually minimal in list view
  avatar?: any;
  certificates?: any[];
}

export interface PersonFormData {
  id?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  birthDate?: string;
  birthPlace?: string;
  gender: number;
  phoneNumber?: string;
  idNumber?: string;
  idNumberIssueBy?: string;
  idNumberIssueDate?: string;
  email?: string;
  maritalStatus?: number;
  taxCode?: string;
  educationLevel?: number;
  height?: number;
  weight?: number;
}

export interface SearchPersonDto extends BaseSearchDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  idNumber?: string;
  taxCode?: string;
  gender?: number;
  maritalStatus?: number;
  educationLevel?: number;

  // Date ranges
  fromBirthDate?: string;
  toBirthDate?: string;
}

export const defaultSearchPersonDto: SearchPersonDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};

export const genderOptions = [
  { value: 0, label: 'Nam' },
  { value: 1, label: 'Nữ' },
  { value: 2, label: 'Khác' },
];

export const maritalStatusOptions = [
  { value: 0, label: 'Độc thân' },
  { value: 1, label: 'Đã kết hôn' },
  { value: 2, label: 'Ly hôn' },
];

export const educationLevelOptions = [
  { value: 0, label: 'THPT' },
  { value: 1, label: 'Trung cấp' },
  { value: 2, label: 'Cao đẳng' },
  { value: 3, label: 'Đại học' },
  { value: 4, label: 'Thạc sĩ' },
  { value: 5, label: 'Tiến sĩ' },
];
