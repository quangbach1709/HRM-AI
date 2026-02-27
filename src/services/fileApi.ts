import { FileDescription, FileFormData, SearchFileDto } from '@/types/file';
import { PageResponse } from '@/types/pagination';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to construct the URL for viewing/downloading a file
 * Uses the same pattern as MyProfile.tsx: /file-descriptions/{id}/view
 * @param imageUrl - Can be a FileDescription object or object with id property
 */
export const getFileUrl = (imageUrl: any): string => {
  if (!imageUrl) return '/placeholder-face.jpg';

  // If it's a FileDescription object or object with id
  if (typeof imageUrl === 'object' && imageUrl.id) {
    return `${API_BASE_URL}/file-descriptions/${imageUrl.id}/view`;
  }

  // If it's a string (direct URL or file path)
  if (typeof imageUrl === 'string') {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return '/placeholder-face.jpg';
};

const mockFiles: FileDescription[] = [

  { id: '1', name: 'avatar_001.jpg', contentType: 'image/jpeg', contentSize: '256KB', filePath: '/uploads/avatars/avatar_001.jpg', extension: 'jpg', createdAt: '2024-01-01' },
  { id: '2', name: 'contract_001.pdf', contentType: 'application/pdf', contentSize: '1.2MB', filePath: '/uploads/contracts/contract_001.pdf', extension: 'pdf', createdAt: '2024-01-02' },
  { id: '3', name: 'certificate_001.pdf', contentType: 'application/pdf', contentSize: '850KB', filePath: '/uploads/certificates/certificate_001.pdf', extension: 'pdf', createdAt: '2024-01-03' },
  { id: '4', name: 'report_q1.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', contentSize: '2.5MB', filePath: '/uploads/reports/report_q1.xlsx', extension: 'xlsx', createdAt: '2024-01-04' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fileApi = {
  search: async (params: SearchFileDto): Promise<PageResponse<FileDescription>> => {
    await delay(300);
    let filtered = [...mockFiles];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(keyword));
    }

    if (params.extension) {
      filtered = filtered.filter(f => f.extension === params.extension);
    }

    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!] || '';
        const bVal = (b as any)[params.sortBy!] || '';
        const compare = String(aVal).localeCompare(String(bVal));
        return params.sortDirection === 'DESC' ? -compare : compare;
      });
    }

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

  getAll: async (): Promise<FileDescription[]> => {
    await delay(200);
    return mockFiles;
  },

  create: async (data: FileFormData): Promise<FileDescription> => {
    await delay(300);
    const newFile: FileDescription = {
      id: String(mockFiles.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockFiles.push(newFile);
    return newFile;
  },

  update: async (id: string, data: FileFormData): Promise<FileDescription> => {
    await delay(300);
    const index = mockFiles.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Không tìm thấy tệp');
    mockFiles[index] = { ...mockFiles[index], ...data, updatedAt: new Date().toISOString() };
    return mockFiles[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockFiles.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Không tìm thấy tệp');
    mockFiles.splice(index, 1);
  },
};
