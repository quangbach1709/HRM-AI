import { SalaryTemplateItem, SalaryTemplateItemFormData, SearchSalaryTemplateItemDto, SalaryResult, SalaryResultFormData, SearchSalaryResultDto } from '@/types/salary';
import { PageResponse } from '@/types/pagination';

const mockTemplateItems: SalaryTemplateItem[] = [
  { id: '1', name: 'Lương cơ bản', code: 'BASIC', displayOrder: 1, salaryTemplateId: '1', salaryItemType: 0, defaultAmount: 10000000, salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' } },
  { id: '2', name: 'Phụ cấp ăn trưa', code: 'LUNCH', displayOrder: 2, salaryTemplateId: '1', salaryItemType: 0, defaultAmount: 500000, salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' } },
  { id: '3', name: 'Phụ cấp xăng xe', code: 'TRANSPORT', displayOrder: 3, salaryTemplateId: '1', salaryItemType: 0, defaultAmount: 300000, salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' } },
  { id: '4', name: 'BHXH', code: 'BHXH', displayOrder: 4, salaryTemplateId: '1', salaryItemType: 1, formula: 'BASIC * 0.08', salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' } },
];

const mockSalaryResults: SalaryResult[] = [
  { id: '1', salaryPeriodId: '1', salaryTemplateId: '1', name: 'Bảng lương tháng 1/2024', salaryPeriod: { id: '1', name: 'Tháng 1/2024' }, salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' }, createdAt: '2024-01-31' },
  { id: '2', salaryPeriodId: '2', salaryTemplateId: '1', name: 'Bảng lương tháng 2/2024', salaryPeriod: { id: '2', name: 'Tháng 2/2024' }, salaryTemplate: { id: '1', name: 'Mẫu lương nhân viên' }, createdAt: '2024-02-29' },
];

const mockTemplates = [
  { id: '1', name: 'Mẫu lương nhân viên' },
  { id: '2', name: 'Mẫu lương quản lý' },
];

const mockPeriods = [
  { id: '1', name: 'Tháng 1/2024' },
  { id: '2', name: 'Tháng 2/2024' },
  { id: '3', name: 'Tháng 3/2024' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const salaryTemplateItemApi = {
  search: async (params: SearchSalaryTemplateItemDto): Promise<PageResponse<SalaryTemplateItem>> => {
    await delay(300);
    let filtered = [...mockTemplateItems];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(
        i => i.name.toLowerCase().includes(keyword) || i.code.toLowerCase().includes(keyword)
      );
    }

    if (params.salaryTemplateId) {
      filtered = filtered.filter(i => i.salaryTemplateId === params.salaryTemplateId);
    }

    if (params.salaryItemType !== undefined) {
      filtered = filtered.filter(i => i.salaryItemType === params.salaryItemType);
    }

    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        if (typeof aVal === 'number') {
          return params.sortDirection === 'DESC' ? bVal - aVal : aVal - bVal;
        }
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

  getTemplates: async () => mockTemplates,

  create: async (data: SalaryTemplateItemFormData): Promise<SalaryTemplateItem> => {
    await delay(300);
    const template = mockTemplates.find(t => t.id === data.salaryTemplateId);
    const newItem: SalaryTemplateItem = {
      id: String(mockTemplateItems.length + 1),
      ...data,
      salaryTemplate: template,
      createdAt: new Date().toISOString(),
    };
    mockTemplateItems.push(newItem);
    return newItem;
  },

  update: async (id: string, data: SalaryTemplateItemFormData): Promise<SalaryTemplateItem> => {
    await delay(300);
    const index = mockTemplateItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Không tìm thấy thành phần lương');
    const template = mockTemplates.find(t => t.id === data.salaryTemplateId);
    mockTemplateItems[index] = { ...mockTemplateItems[index], ...data, salaryTemplate: template, updatedAt: new Date().toISOString() };
    return mockTemplateItems[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockTemplateItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Không tìm thấy thành phần lương');
    mockTemplateItems.splice(index, 1);
  },
};

export const salaryResultApi = {
  search: async (params: SearchSalaryResultDto): Promise<PageResponse<SalaryResult>> => {
    await delay(300);
    let filtered = [...mockSalaryResults];

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(keyword));
    }

    if (params.salaryPeriodId) {
      filtered = filtered.filter(r => r.salaryPeriodId === params.salaryPeriodId);
    }

    if (params.salaryTemplateId) {
      filtered = filtered.filter(r => r.salaryTemplateId === params.salaryTemplateId);
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

  getTemplates: async () => mockTemplates,
  getPeriods: async () => mockPeriods,

  create: async (data: SalaryResultFormData): Promise<SalaryResult> => {
    await delay(300);
    const template = mockTemplates.find(t => t.id === data.salaryTemplateId);
    const period = mockPeriods.find(p => p.id === data.salaryPeriodId);
    const newResult: SalaryResult = {
      id: String(mockSalaryResults.length + 1),
      ...data,
      salaryTemplate: template,
      salaryPeriod: period,
      createdAt: new Date().toISOString(),
    };
    mockSalaryResults.push(newResult);
    return newResult;
  },

  update: async (id: string, data: SalaryResultFormData): Promise<SalaryResult> => {
    await delay(300);
    const index = mockSalaryResults.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Không tìm thấy bảng lương');
    const template = mockTemplates.find(t => t.id === data.salaryTemplateId);
    const period = mockPeriods.find(p => p.id === data.salaryPeriodId);
    mockSalaryResults[index] = { ...mockSalaryResults[index], ...data, salaryTemplate: template, salaryPeriod: period, updatedAt: new Date().toISOString() };
    return mockSalaryResults[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockSalaryResults.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Không tìm thấy bảng lương');
    mockSalaryResults.splice(index, 1);
  },
};
