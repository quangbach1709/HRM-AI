import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef, PageResponse } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalaryResultItemDetail, SearchSalaryResultItemDetailDto } from '@/types/salaryResultItemDetail';
import { salaryResultItemDetailApi } from '@/services/salaryResultItemDetailApi';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import salaryTemplateItemApi
const salaryTemplateItemApi = {
  async getAll(): Promise<Array<{ id: string; name: string; code?: string }>> {
    const { api } = await import('@/services/api');
    const response = await api.get<Array<{ id: string; name: string; code?: string }>>('/salary-template-items/all');
    return response.data;
  }
};

const defaultSearchParams: SearchSalaryResultItemDetailDto = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  voided: false,
};

export default function MySalary() {
  const { toast } = useToast();
  const [data, setData] = useState<PageResponse<SalaryResultItemDetail>>({
    content: [],
    pageIndex: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchSalaryResultItemDetailDto>(defaultSearchParams);

  // View modal
  const [viewingItem, setViewingItem] = useState<SalaryResultItemDetail | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Dropdown data
  const [salaryTemplateItems, setSalaryTemplateItems] = useState<Array<{ id: string; name: string; code?: string }>>([]);

  // Use ref to prevent double fetch on mount in React StrictMode
  const hasFetched = React.useRef(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await salaryResultItemDetailApi.searchForCurrentUser(searchParams);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const templateItemsRes = await salaryTemplateItemApi.getAll();
      setSalaryTemplateItems(templateItemsRes);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  // Initial fetch only once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
      fetchDropdownData();
    }
  }, []);

  // Fetch when search params change (except on initial mount)
  useEffect(() => {
    if (hasFetched.current) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.pageIndex, searchParams.pageSize, searchParams.sortBy, searchParams.sortDirection, searchParams.keyword, searchParams.salaryTemplateItemId]);

  const handlePageChange = (pageIndex: number) => {
    setSearchParams(prev => ({ ...prev, pageIndex }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setSearchParams(prev => ({ ...prev, pageSize, pageIndex: 0 }));
  };

  const handleSort = (sortBy: string, sortDirection: 'ASC' | 'DESC') => {
    setSearchParams(prev => ({ ...prev, sortBy, sortDirection }));
  };

  const handleFilter = (filters: Partial<SearchSalaryResultItemDetailDto>) => {
    setSearchParams(prev => ({ ...prev, ...filters, pageIndex: 0 }));
  };

  const handleSearch = (keyword: string) => {
    setSearchParams(prev => ({ ...prev, keyword, pageIndex: 0 }));
  };

  const handleView = (item: SalaryResultItemDetail) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnDef<SalaryResultItemDetail>[] = useMemo(
    () => [
      {
        key: 'salaryTemplateItem.displayOrder',
        header: 'TT',
        sortable: true,
        sortKey: 'salaryTemplateItem.displayOrder',
        width: '60px',
        render: (_, row) => row.salaryTemplateItem?.displayOrder || '-',
      },
      {
        key: 'salaryTemplateItem.code',
        header: 'Mã',
        sortable: false,
        render: (_, row) => <span className="font-mono text-xs">{row.salaryTemplateItem?.code || '-'}</span>,
      },
      {
        key: 'salaryTemplateItem.name',
        header: 'Thành phần lương',
        sortable: false,
        filterable: true,
        filterType: 'select',
        filterKey: 'salaryTemplateItemId',
        filterOptions: salaryTemplateItems.map(t => ({ label: t.name, value: t.id })),
        render: (_, row) => row.salaryTemplateItem?.name || '-',
      },
      {
        key: 'value',
        header: 'Giá trị',
        sortable: true,
        sortKey: 'value',
        render: (val) => <span className="font-mono font-medium">{formatCurrency(val as number)}</span>,
        width: '150px',
      },
      {
        key: 'createdAt',
        header: 'Ngày tạo',
        sortable: true,
        sortKey: 'createdAt',
        render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
        width: '120px',
      },
    ],
    [salaryTemplateItems]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bảng lương của tôi"
        description="Xem chi tiết các khoản lương của bạn"
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Tìm kiếm theo thành phần lương..."
            value={searchParams.keyword || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select
          value={searchParams.salaryTemplateItemId || 'all'}
          onValueChange={(value) => handleFilter({ salaryTemplateItemId: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Thành phần lương" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thành phần</SelectItem>
            {salaryTemplateItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          sortBy={searchParams.sortBy}
          sortDirection={searchParams.sortDirection}
          onSort={handleSort}
          onFilter={(filters) => handleFilter(filters as Partial<SearchSalaryResultItemDetailDto>)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={handleView}
          groupBy="salaryResultItem.id"
          renderGroupHeader={(value, row) => (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{row.salaryResultItem?.staff?.staffCode}</Badge>
              <span className="font-bold text-base">{row.salaryResultItem?.staff?.displayName}</span>
              <span className="text-muted-foreground text-sm mx-2">•</span>
              <span className="text-sm">{row.salaryResultItem?.salaryResult?.name}</span>
            </div>
          )}
        />
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết khoản lương</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Thành phần lương</p>
                  <p className="font-medium">{viewingItem.salaryTemplateItem?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã</p>
                  <p className="font-mono">{viewingItem.salaryTemplateItem?.code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị</p>
                  <p className="font-bold text-lg">{formatCurrency(viewingItem.value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p>{viewingItem.createdAt ? new Date(viewingItem.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
