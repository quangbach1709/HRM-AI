import { Person, PersonFormData, SearchPersonDto } from './person';
import { SalaryTemplate } from './salaryTemplate';

export interface Staff extends Person {
    staffCode: string;
    recruitmentDate?: string;
    startDate?: string;
    apprenticeDays?: number;
    employeeStatus?: number; // 0: Working, 1: Resigned, 2: On Leave ...
    staffPhase?: number; // 0: Probation, 1: Official ...
    requireAttendance?: boolean;
    allowExternalIpTimekeeping?: boolean;
    salaryTemplate?: SalaryTemplate;
}

export interface StaffFormData extends PersonFormData {
    staffCode: string;
    recruitmentDate?: string;
    startDate?: string;
    apprenticeDays?: number;
    employeeStatus?: number;
    staffPhase?: number;
    requireAttendance?: boolean;
    allowExternalIpTimekeeping?: boolean;
    salaryTemplate?: { id: string }; // For validation/submission
}

export interface SearchStaffDto extends SearchPersonDto {
    staffCode?: string;
    employeeStatus?: number;
    staffPhase?: number;
    salaryTemplateId?: string;
    requireAttendance?: boolean;
    allowExternalIpTimekeeping?: boolean;
}

export const defaultSearchStaffDto: SearchStaffDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};

// Enums (mock values based on common sense, user can adjust)
export enum EmployeeStatus {
    WORKING = 0,
    RESIGNED = 1,
    ON_LEAVE = 2,
    MATERNITY_LEAVE = 3
}

export enum StaffPhase {
    PROBATION = 0,
    OFFICIAL = 1
}

export const EmployeeStatusLabel: Record<number, string> = {
    0: 'Đang làm việc',
    1: 'Đã nghỉ việc',
    2: 'Nghỉ phép',
    3: 'Nghỉ thai sản'
};

export const StaffPhaseLabel: Record<number, string> = {
    0: 'Thử việc',
    1: 'Chính thức'
};
