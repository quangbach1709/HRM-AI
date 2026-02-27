// StaffLabourAgreement Types
export interface LabourAgreement {
  id: string;
  staffId: string;
  contractType: number; // 0: Thử việc, 1: Có thời hạn, 2: Không thời hạn
  laborAgreementNumber: number;
  startDate: string;
  endDate?: string;
  durationMonths?: number;
  workingHour: number;
  workingHourWeekMin?: number;
  salary: number;
  signedDate: string;
  agreementStatus: number; // 0: Hiệu lực, 1: Hết hạn, 2: Đã hủy
  staff?: {
    id: string;
    staffCode: string;
    displayName: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface LabourAgreementFormData {
  id?: string;
  staffId: string;
  contractType: number;
  laborAgreementNumber: number;
  startDate: string;
  endDate?: string;
  durationMonths?: number;
  workingHour: number;
  workingHourWeekMin?: number;
  salary: number;
  signedDate: string;
  agreementStatus: number;
}

export interface SearchLabourAgreementDto {
  keyword?: string;
  staffId?: string;
  contractType?: number;
  agreementStatus?: number;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchLabourAgreementDto: SearchLabourAgreementDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'signedDate',
  sortDirection: 'DESC',
};

export const contractTypeOptions = [
  { value: 0, label: 'Thử việc' },
  { value: 1, label: 'Có thời hạn' },
  { value: 2, label: 'Không thời hạn' },
];

export const agreementStatusOptions = [
  { value: 0, label: 'Hiệu lực' },
  { value: 1, label: 'Hết hạn' },
  { value: 2, label: 'Đã hủy' },
];
