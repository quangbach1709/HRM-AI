// FileDescription Types
export interface FileDescription {
  id: string;
  name: string;
  contentType: string;
  contentSize: string;
  filePath: string;
  extension: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface FileFormData {
  id?: string;
  name: string;
  contentType: string;
  contentSize: string;
  filePath: string;
  extension: string;
}

export interface SearchFileDto {
  keyword?: string;
  extension?: string;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const defaultSearchFileDto: SearchFileDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'name',
  sortDirection: 'ASC',
};
