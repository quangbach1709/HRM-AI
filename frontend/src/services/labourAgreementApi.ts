import { LabourAgreement, LabourAgreementFormData, SearchLabourAgreementDto } from '@/types/labour-agreement';
import { PageResponse } from '@/types/pagination';

const mockAgreements: LabourAgreement[] = [
  { id: '1', staffId: '1', contractType: 2, laborAgreementNumber: 1, startDate: '2024-01-01', workingHour: 8, salary: 25000000, signedDate: '2023-12-25', agreementStatus: 0, staff: { id: '1', staffCode: 'NV001', displayName: 'Nguyễn Văn A' }, createdAt: '2024-01-01' },
  { id: '2', staffId: '2', contractType: 1, laborAgreementNumber: 2, startDate: '2024-02-01', endDate: '2025-02-01', durationMonths: 12, workingHour: 8, salary: 20000000, signedDate: '2024-01-25', agreementStatus: 0, staff: { id: '2', staffCode: 'NV002', displayName: 'Trần Thị B' }, createdAt: '2024-02-01' },
  { id: '3', staffId: '3', contractType: 0, laborAgreementNumber: 3, startDate: '2024-03-01', endDate: '2024-05-01', durationMonths: 2, workingHour: 8, salary: 8000000, signedDate: '2024-02-25', agreementStatus: 0, staff: { id: '3', staffCode: 'NV003', displayName: 'Lê Văn C' }, createdAt: '2024-03-01' },
];

const mockStaff = [
  { id: '1', staffCode: 'NV001', displayName: 'Nguyễn Văn A' },
  { id: '2', staffCode: 'NV002', displayName: 'Trần Thị B' },
  { id: '3', staffCode: 'NV003', displayName: 'Lê Văn C' },
  { id: '4', staffCode: 'NV004', displayName: 'Phạm Thị D' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const labourAgreementApi = {
  search: async (params: SearchLabourAgreementDto): Promise<PageResponse<LabourAgreement>> => {
    await delay(300);
    let filtered = [...mockAgreements];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        a => a.staff?.displayName?.toLowerCase().includes(keyword) || a.staff?.staffCode?.toLowerCase().includes(keyword)
      );
    }

    if (params.staffId) {
      filtered = filtered.filter(a => a.staffId === params.staffId);
    }

    if (params.contractType !== undefined) {
      filtered = filtered.filter(a => a.contractType === params.contractType);
    }

    if (params.agreementStatus !== undefined) {
      filtered = filtered.filter(a => a.agreementStatus === params.agreementStatus);
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

  getStaff: async () => mockStaff,

  create: async (data: LabourAgreementFormData): Promise<LabourAgreement> => {
    await delay(300);
    const staff = mockStaff.find(s => s.id === data.staffId);
    const newAgreement: LabourAgreement = {
      id: String(mockAgreements.length + 1),
      ...data,
      staff,
      createdAt: new Date().toISOString(),
    };
    mockAgreements.push(newAgreement);
    return newAgreement;
  },

  update: async (id: string, data: LabourAgreementFormData): Promise<LabourAgreement> => {
    await delay(300);
    const index = mockAgreements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Không tìm thấy hợp đồng');
    const staff = mockStaff.find(s => s.id === data.staffId);
    mockAgreements[index] = { ...mockAgreements[index], ...data, staff, updatedAt: new Date().toISOString() };
    return mockAgreements[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockAgreements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Không tìm thấy hợp đồng');
    mockAgreements.splice(index, 1);
  },
};
