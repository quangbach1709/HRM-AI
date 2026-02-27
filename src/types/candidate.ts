import { BaseSearchDto } from './common';

export interface Candidate {
    id: string;
    candidateCode: string;
    positionId: string;
    submissionDate: string;
    interviewDate?: string;
    desiredPay?: number;
    possibleWorkingDate?: string;
    onboardDate?: string;
    introducerId?: string;
    candidateStatus: number;
    workExperience?: string;
    recruitmentRequestId?: string;

    // Person fields
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    birthDate?: string;
    birthPlace?: string;
    gender?: number;
    idNumber?: string;
    idNumberIssueBy?: string;
    idNumberIssueDate?: string;
    maritalStatus?: number;
    taxCode?: string;
    educationLevel?: number;

    // Relations
    position?: { id: string; name: string };
    introducer?: { id: string; displayName: string };
    recruitmentRequest?: { id: string; name: string; description?: string; request?: string };
    cvFile?: { id: string; name: string; contentType?: string };
    score?: number; // Điểm đánh giá của HR (0-100)

    voided?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CandidateFormData {
    id?: string;
    // Candidate Info
    candidateCode: string;
    positionId: string;
    submissionDate: string;
    interviewDate?: string;
    desiredPay?: number;
    possibleWorkingDate?: string;
    onboardDate?: string;
    introducerId?: string;
    candidateStatus: number;
    workExperience?: string;
    recruitmentRequestId?: string;

    // Person Info
    firstName: string;
    lastName: string;
    displayName: string;
    email?: string;
    phoneNumber: string;
    birthDate?: string;
    birthPlace?: string;
    gender?: number;
    idNumber?: string;
    idNumberIssueBy?: string;
    idNumberIssueDate?: string;
    maritalStatus?: number;
    taxCode?: string;
    educationLevel?: number;

    // CV File
    cvFileId?: string;
}

export interface SearchCandidateDto extends BaseSearchDto {
    candidateCode?: string;
    positionId?: string;
    candidateStatus?: number;
    recruitmentRequestId?: string;
    introducerId?: string;
    // Can filter by person fields via keyword, but not strict fields in basic search UI usually
}

export const defaultSearchCandidateDto: SearchCandidateDto = {
    pageIndex: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    voided: false,
};

export const CandidateStatus = {
    CREATED: 0,
    PRE_SCREENED: 1,
    INTERVIEW_PASSED: 2,
    HIRED: 3,
    REJECTED: 4
};

export const candidateStatusOptions = [
    { value: 0, label: 'Khởi tạo' },
    { value: 1, label: 'Đã sơ lọc' },
    { value: 2, label: 'Qua phỏng vấn' },
    { value: 3, label: 'Đã nhận việc' },
    { value: 4, label: 'Từ chối' },
];
