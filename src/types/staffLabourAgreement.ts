import { BaseSearchDto } from './common';
import { Staff } from './staff';

export interface StaffLabourAgreement {
    id: string;
    staff: Staff;
    contractType: number;
    labourAgreementNumber: string;
    startDate: string;
    endDate?: string;
    durationMonths?: number;
    workingHour?: number;
    workingHourWeekMin?: number;
    salary?: number;
    signedDate?: string;
    agreementStatus: number;

    // Audit fields
    voided?: boolean;
    createDate?: string;
    modifyDate?: string;
    createdBy?: string;
    modifiedBy?: string;
}

export interface StaffLabourAgreementFormData {
    id?: string;
    staff: { id: string };
    contractType: number;
    labourAgreementNumber: string;
    startDate: string;
    endDate?: string;
    durationMonths?: number;
    workingHour?: number;
    workingHourWeekMin?: number;
    salary?: number;
    signedDate?: string;
    agreementStatus: number;
}

export interface SearchStaffLabourAgreementDto extends BaseSearchDto {
    staffId?: string;
    labourAgreementNumber?: string;
    contractType?: number;
    agreementStatus?: number;

    fromStartDate?: string;
    toStartDate?: string;

    fromEndDate?: string;
    toEndDate?: string;

    fromSignedDate?: string;
    toSignedDate?: string;
}

export const defaultSearchStaffLabourAgreementDto: SearchStaffLabourAgreementDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createDate',
    sortDirection: 'DESC',
    voided: false,
};

export enum ContractType {
    PROBATION = 1,
    OFFICIAL = 2,
    SEASONAL = 3,
    FIXED_TERM = 4,
    UNLIMITED_TERM = 5
}

export const ContractTypeLabel: Record<number, string> = {
    1: 'Thử việc',
    2: 'Chính thức',
    3: 'Thời vụ',
    4: 'Xác định thời hạn',
    5: 'Không xác định thời hạn'
};

export enum AgreementStatus {
    UNSIGNED = 1,
    SIGNED = 2,
    TERMINATED = 3,
    EXPIRED = 4
}

export const AgreementStatusLabel: Record<number, string> = {
    1: 'Hợp đồng chưa được ký',
    2: 'Hợp đồng đã được ký',
    3: 'Đã chấm dứt',
    4: 'Đã hết hạn'
};
