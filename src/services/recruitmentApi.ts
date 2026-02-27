import { api } from './api';
import { RecruitmentRequest, RecruitmentRequestFormData, SearchRecruitmentRequestDto, Candidate, CandidateFormData, SearchCandidateDto } from '@/types/recruitment';
import { PageResponse } from '@/types/pagination';
import { staffApi } from './staffApi';
import { positionApi } from './positionApi';

const ENDPOINT = '/recruitment-requests';

// Mock data for candidates to keep it working (until backend is ready for candidates)
const mockCandidates: Candidate[] = [
  { id: '1', candidateCode: 'CAND-001', positionId: '1', submissionDate: '2024-01-20', interviewDate: '2024-01-25', desiredPay: 25000000, candidateStatus: 2, workExperience: '3 năm kinh nghiệm React', person: { id: '5', displayName: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phoneNumber: '0905678901' }, position: { id: '1', name: 'Frontend Developer' }, createdAt: '2024-01-20' },
  { id: '2', candidateCode: 'CAND-002', positionId: '1', submissionDate: '2024-01-22', candidateStatus: 1, workExperience: '2 năm kinh nghiệm Vue.js', person: { id: '6', displayName: 'Vũ Thị F', email: 'vuthif@gmail.com', phoneNumber: '0906789012' }, position: { id: '1', name: 'Frontend Developer' }, createdAt: '2024-01-22' },
  { id: '3', candidateCode: 'CAND-003', positionId: '2', submissionDate: '2024-02-05', candidateStatus: 0, workExperience: '5 năm kinh nghiệm kế toán', person: { id: '7', displayName: 'Đỗ Văn G', email: 'dovang@gmail.com', phoneNumber: '0907890123' }, position: { id: '2', name: 'Kế toán' }, createdAt: '2024-02-05' },
];

const mockPositions = [
  { id: '1', name: 'Frontend Developer' },
  { id: '2', name: 'Kế toán' },
  { id: '3', name: 'Backend Developer' },
  { id: '4', name: 'UI/UX Designer' },
  { id: '15d31513-33fa-4340-a19e-e883df1869e0', name: 'Giám đốc nhân sự' } // Example valid position ID
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const recruitmentRequestApi = {
  // ==================== PAGINATION ====================
  search: async (params: SearchRecruitmentRequestDto): Promise<PageResponse<RecruitmentRequest>> => {
    const response = await api.post<PageResponse<RecruitmentRequest>>(
      `${ENDPOINT}/search`,
      params
    );
    return response.data;
  },

  // ==================== CRUD ====================
  getById: async (id: string): Promise<RecruitmentRequest> => {
    const response = await api.get<RecruitmentRequest>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  getAll: async (): Promise<RecruitmentRequest[]> => {
    const response = await api.get<RecruitmentRequest[]>(`${ENDPOINT}/all`);
    return response.data;
  },

  create: async (data: RecruitmentRequestFormData): Promise<RecruitmentRequest> => {
    // Transform flat ID fields to nested objects for backend
    const payload = {
      ...data,
      proposer: { id: data.proposerId },
      position: { id: data.positionId }
    };
    const response = await api.post<RecruitmentRequest>(ENDPOINT, payload);
    return response.data;
  },

  update: async (id: string, data: RecruitmentRequestFormData): Promise<RecruitmentRequest> => {
    // Transform flat ID fields to nested objects for backend
    const payload = {
      ...data,
      proposer: { id: data.proposerId },
      position: { id: data.positionId }
    };
    const response = await api.put<RecruitmentRequest>(`${ENDPOINT}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  // ==================== HELPERS ====================
  getPositions: async () => {
    try {
      const response = await positionApi.getAll();
      return response;
    } catch (e) {
      console.error("Failed to load positions", e);
      return [];
    }
  },

  getStaff: async () => {
    try {
      const response = await staffApi.getAll();
      return response;
    } catch (e) {
      console.error("Failed to load staff", e);
      return [];
    }
  },

  export: async (params: SearchRecruitmentRequestDto): Promise<RecruitmentRequest[]> => {
    const response = await api.post<RecruitmentRequest[]>(`${ENDPOINT}/export`, params);
    return response.data;
  },
};

export const candidateApi = {
  search: async (params: SearchCandidateDto): Promise<PageResponse<Candidate>> => {
    await delay(300);
    // Mock implementation for now
    let filtered = [...mockCandidates];
    // ... mock logic ...
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / params.pageSize);
    const start = params.pageIndex * params.pageSize;
    const content = filtered.slice(start, start + params.pageSize);
    return {
      content,
      pageNumber: params.pageIndex,
      pageSize: params.pageSize,
      totalElements,
      totalPages,
      first: params.pageIndex === 0,
      last: params.pageIndex >= totalPages - 1,
      hasNext: params.pageIndex < totalPages - 1,
      hasPrevious: params.pageIndex > 0,
    };
  },

  getPositions: async () => mockPositions,
  getStaff: async () => [],
  getRequests: async () => [],

  create: async (data: CandidateFormData): Promise<Candidate> => {
    await delay(300);
    return {} as Candidate;
  },

  update: async (id: string, data: CandidateFormData): Promise<Candidate> => {
    await delay(300);
    return {} as Candidate;
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
  },
};
