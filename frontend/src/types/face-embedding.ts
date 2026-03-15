// FaceEmbedding Types
export interface FaceEmbedding {
  id: string;
  personId?: string;
  imageUrl?: any; // FileDescriptionDto object from backend (có .url trỏ MinIO)
  active: boolean;
  modelVersion?: string;
  /** Góc chụp: front / left / right */
  angle?: string;
  /** ID tham chiếu bản ghi embedding vector bên AI Service */
  aiEmbeddingId?: string;
  person?: {
    id: string;
    displayName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}


export interface FaceEmbeddingFormData {
  id?: string;
  personId: string;
  imageUrl: string;
  active: boolean;
}

export interface SearchFaceEmbeddingDto {
  keyword?: string;
  personId?: string;
  active?: boolean;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchFaceEmbeddingDto: SearchFaceEmbeddingDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};
