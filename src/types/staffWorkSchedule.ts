import { BaseSearchDto, SortDirection } from './common';
import { Person } from './person'; // or Staff type if exists

export interface Staff {
    id: string;
    staffCode: string;
    displayName: string;
    // other fields if needed
}

export interface StaffWorkSchedule {
    id: string;
    shiftWorkType?: number;
    staff?: Staff;
    workingDate?: string; // Date string
    checkIn?: string; // Date string (Start Date)
    checkOut?: string; // Date string (End Date)
    shiftWorkStatus?: number;
    coordinator?: Staff;
    isLocked?: boolean;

    // Audit
    createdAt?: string;
    modifiedAt?: string;
    createdBy?: string;
    modifiedBy?: string;
    voided?: boolean;
}

export interface StaffWorkScheduleFormData {
    id?: string;
    shiftWorkType?: number;
    staffId?: string;
    workingDate?: string;
    checkIn?: string;
    checkOut?: string;
    shiftWorkStatus?: number;
    coordinatorId?: string;
    isLocked?: boolean;
}

export interface SearchStaffWorkScheduleDto extends BaseSearchDto {
    shiftWorkType?: number;
    shiftWorkStatus?: number;
    staffId?: string;
    coordinatorId?: string;
    isLocked?: boolean;
}

export const defaultSearchStaffWorkScheduleDto: SearchStaffWorkScheduleDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};
