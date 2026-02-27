// RecruitmentRequest Types
export interface RecruitmentRequest {
  id: string;
  code: string;
  name: string;
  proposerId: string;
  proposalDate: string;
  request: string;
  positionId: string;
  proposer?: {
    id: string;
    displayName: string;
    staffCode?: string;
  };
  position?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  voided?: boolean;
}

export interface RecruitmentRequestFormData {
  id?: string;
  code: string;
  name: string;
  proposerId: string; // Used for creating/updating
  proposer?: { id: string }; // Used for structure matching
  proposalDate: string;
  request: string;
  positionId: string; // Used for creating/updating
  position?: { id: string }; // Used for structure matching
}

export interface SearchRecruitmentRequestDto {
  id?: string;
  keyword?: string;
  positionId?: string;
  proposerId?: string;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  voided?: boolean;
  fromDate?: string;
  toDate?: string;
}

export const defaultSearchRecruitmentRequestDto: SearchRecruitmentRequestDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'proposalDate',
  sortDirection: 'DESC',
  voided: false,
};

// Candidate Types
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
  staffId?: string;
  candidateStatus: number; // 0: Khởi tạo, 1: Đã sơ lọc, 2: Qua phỏng vấn, 3: Đã nhận việc, 4: Từ chối
  workExperience?: string;
  recruitmentRequestId?: string;
  personId?: string;
  person?: {
    id: string;
    displayName: string;
    email?: string;
    phoneNumber?: string;
  };
  position?: {
    id: string;
    name: string;
  };
  introducer?: {
    id: string;
    displayName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateFormData {
  id?: string;
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
  personId?: string;
}

export interface SearchCandidateDto {
  keyword?: string;
  positionId?: string;
  candidateStatus?: number;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchCandidateDto: SearchCandidateDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'submissionDate',
  sortDirection: 'DESC',
};

export const candidateStatusOptions = [
  { value: 0, label: 'Khởi tạo' },
  { value: 1, label: 'Đã sơ lọc' },
  { value: 2, label: 'Qua phỏng vấn' },
  { value: 3, label: 'Đã nhận việc' },
  { value: 4, label: 'Từ chối' },
];
