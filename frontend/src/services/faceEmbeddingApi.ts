import { FaceEmbedding, SearchFaceEmbeddingDto } from '@/types/face-embedding';
import { PageResponse } from '@/types/pagination';
import { api } from './api';
import axios from 'axios';

const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000';
const AI_BASE_URL = `${GATEWAY_BASE_URL}/api/v1/ai`;

/** Tạo axios instance trỏ đến AI Service qua Gateway */
const aiApi = axios.create({ baseURL: AI_BASE_URL });
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const faceEmbeddingApi = {
  /**
   * Tìm kiếm face embeddings với phân trang
   */
  search: async (params: SearchFaceEmbeddingDto): Promise<PageResponse<FaceEmbedding>> => {
    const response = await api.post<PageResponse<FaceEmbedding>>('/face-embeddings/search', params);
    return response.data;
  },

  /**
   * Lấy face embedding theo ID
   */
  getById: async (id: string): Promise<FaceEmbedding> => {
    const response = await api.get<FaceEmbedding>(`/face-embeddings/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách face embeddings của một person
   */
  getByPersonId: async (personId: string): Promise<FaceEmbedding[]> => {
    const response = await api.get<FaceEmbedding[]>(`/face-embeddings/person/${personId}`);
    return response.data;
  },

  /**
   * Đăng ký khuôn mặt - gửi 3 ảnh góc mặt đến AI Service qua API Gateway
   * AI Service sẽ:
   *   1. Trích xuất embedding vector (ArcFace)
   *   2. Upload ảnh lên MinIO
   *   3. Lưu embedding vào DB riêng của AI Service
   *   4. Publish message lên RabbitMQ để Backend Java tạo FaceEmbedding metadata
   */
  registerFace: async (frames: File[]): Promise<{ success: boolean; message: string; data: any[] }> => {
    const formData = new FormData();
    frames.forEach((frame) => {
      formData.append('frames', frame);
    });

    const response = await aiApi.post<{ success: boolean; message: string; data: any[] }>(
      '/face-registration/register',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Cập nhật face embedding (HR duyệt: set isActive = true)
   */
  update: async (id: string, data: { personId: string; isActive: boolean; modelVersion?: string }): Promise<FaceEmbedding> => {
    const response = await api.put<FaceEmbedding>(`/face-embeddings/${id}`, {
      person: { id: data.personId },
      isActive: data.isActive,
      modelVersion: data.modelVersion,
    });
    return response.data;
  },

  /**
   * Xóa face embedding (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/face-embeddings/${id}`);
  },
};


