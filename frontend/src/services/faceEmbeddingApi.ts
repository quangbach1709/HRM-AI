import { FaceEmbedding, SearchFaceEmbeddingDto } from '@/types/face-embedding';
import { PageResponse } from '@/types/pagination';
import { api } from './api';

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
   * Đăng ký khuôn mặt - gửi 3 ảnh góc mặt
   */
  registerFace: async (frames: File[]): Promise<FaceEmbedding[]> => {
    const formData = new FormData();
    frames.forEach((frame) => {
      formData.append('frames', frame);
    });

    const response = await api.post<FaceEmbedding[]>('/face-embeddings/register-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Cập nhật face embedding
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

