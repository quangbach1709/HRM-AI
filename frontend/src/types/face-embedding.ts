// FaceEmbedding Types
export interface FaceEmbedding {
  id: string;
  personId?: string;
  embeddingVector?: number[];
  imageUrl?: any; // FileDescriptionDto object from backend
  active: boolean;
  modelVersion?: string;
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
