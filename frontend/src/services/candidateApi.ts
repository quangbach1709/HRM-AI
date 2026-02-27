import { api } from './api';
import { Candidate, CandidateFormData, SearchCandidateDto } from '@/types/candidate';
import { PageResponse } from '@/types/pagination';
import axios from 'axios';

const ENDPOINT = '/candidates';
const PUBLIC_ENDPOINT = '/public/candidates';
const API_BASE_URL = 'http://localhost:8080/api';

// Public API (no auth required)
const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const candidateApi = {
    search: async (params: SearchCandidateDto): Promise<PageResponse<Candidate>> => {
        const response = await api.post<PageResponse<Candidate>>(
            `${ENDPOINT}/search`,
            params
        );
        return response.data;
    },

    getAll: async (): Promise<Candidate[]> => {
        const response = await api.get<Candidate[]>(`${ENDPOINT}/all`);
        return response.data;
    },

    getById: async (id: string): Promise<Candidate> => {
        const response = await api.get<Candidate>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    create: async (data: CandidateFormData): Promise<Candidate> => {
        const payload = {
            ...data,
            position: { id: data.positionId },
            introducer: data.introducerId ? { id: data.introducerId } : null,
            recruitmentRequest: data.recruitmentRequestId ? { id: data.recruitmentRequestId } : null,
            cvFile: data.cvFileId ? { id: data.cvFileId } : null,
        };
        const response = await api.post<Candidate>(ENDPOINT, payload);
        return response.data;
    },

    update: async (id: string, data: CandidateFormData): Promise<Candidate> => {
        const payload = {
            ...data,
            position: { id: data.positionId },
            introducer: data.introducerId ? { id: data.introducerId } : null,
            recruitmentRequest: data.recruitmentRequestId ? { id: data.recruitmentRequestId } : null,
            cvFile: data.cvFileId ? { id: data.cvFileId } : null,
        };
        const response = await api.put<Candidate>(`${ENDPOINT}/${id}`, payload);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    export: async (params: SearchCandidateDto): Promise<Candidate[]> => {
        const response = await api.post<Candidate[]>(`${ENDPOINT}/export`, params);
        return response.data;
    },

    // HR only - update candidate score
    updateScore: async (id: string, score: number): Promise<Candidate> => {
        const response = await api.put<Candidate>(`${ENDPOINT}/${id}/score`, { score });
        return response.data;
    },
};

// Public API for external applicants (no authentication required)
export const publicCandidateApi = {
    create: async (data: CandidateFormData): Promise<Candidate> => {
        const payload = {
            ...data,
            position: data.positionId ? { id: data.positionId } : null,
            recruitmentRequest: data.recruitmentRequestId ? { id: data.recruitmentRequestId } : null,
            cvFile: data.cvFileId ? { id: data.cvFileId } : null,
        };
        const response = await publicApi.post<Candidate>(PUBLIC_ENDPOINT, payload);
        return response.data;
    },

    getById: async (id: string): Promise<Candidate> => {
        const response = await publicApi.get<Candidate>(`${PUBLIC_ENDPOINT}/${id}`);
        return response.data;
    },

    update: async (id: string, data: CandidateFormData): Promise<Candidate> => {
        const payload = {
            ...data,
            position: data.positionId ? { id: data.positionId } : null,
            recruitmentRequest: data.recruitmentRequestId ? { id: data.recruitmentRequestId } : null,
            cvFile: data.cvFileId ? { id: data.cvFileId } : null,
        };
        const response = await publicApi.put<Candidate>(`${PUBLIC_ENDPOINT}/${id}`, payload);
        return response.data;
    },

    verify: async (candidateCode: string, phoneNumber: string): Promise<Candidate> => {
        const response = await publicApi.post<Candidate>(`${PUBLIC_ENDPOINT}/verify`, {
            candidateCode,
            phoneNumber
        });
        return response.data;
    },

    uploadCv: async (file: File): Promise<{ id: string; name: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await publicApi.post(`${PUBLIC_ENDPOINT}/upload-cv`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
};

