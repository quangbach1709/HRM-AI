import axios from 'axios';

const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000';
const AI_BASE_URL = `${GATEWAY_BASE_URL}/api/v1/ai`;

/** Axios instance trỏ đến AI Service qua API Gateway */
const aiApi = axios.create({ baseURL: AI_BASE_URL });
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AttendanceVerifyResponse {
  verified: boolean;
  requireVideoVerification: boolean;
  message: string;
  personId: string | null;
}

export const aiAttendanceApi = {
  /**
   * Gửi một ảnh chụp để AI Service kiểm tra chống giả mạo và xác thực khuôn mặt.
   * Nếu phát hiện giả mạo, trả về requireVideoVerification: true.
   * Nếu khớp khuôn mặt, AI Service publish RabbitMQ để backend ghi nhận chấm công.
   */
  checkImage: async (
    image: File,
    staffId: string,
    shiftWorkType: number
  ): Promise<AttendanceVerifyResponse> => {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('staffId', staffId);
    formData.append('shiftWorkType', String(shiftWorkType));

    const response = await aiApi.post<AttendanceVerifyResponse>(
      '/attendance/check-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Gửi nhiều frame video để AI Service kiểm tra chống giả mạo (≥70% real)
   * và xác thực khuôn mặt.
   * Nếu khớp, AI Service publish RabbitMQ để backend ghi nhận chấm công.
   */
  verifyVideo: async (
    frames: File[],
    staffId: string,
    shiftWorkType: number
  ): Promise<AttendanceVerifyResponse> => {
    const formData = new FormData();
    frames.forEach((frame) => formData.append('files', frame));
    formData.append('staffId', staffId);
    formData.append('shiftWorkType', String(shiftWorkType));

    const response = await aiApi.post<AttendanceVerifyResponse>(
      '/attendance/verify-video',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
