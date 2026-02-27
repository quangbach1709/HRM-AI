import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Pencil, Trash2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalaryResultItem, SearchSalaryResultItemDto } from '@/types/salaryResultItem';
import { useSalaryResultItems } from '@/hooks/useSalaryResultItems';
import { SalaryResultItemFormModal } from '@/components/modals/SalaryResultItemFormModal';
import { salaryResultItemApi } from '@/services/salaryResultItemApi';
import { salaryResultApi } from '@/services/salaryResultApi';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageHeader } from '@/components/ui/page-header';

// Import staff API
const staffApi = {
  async getAll(): Promise<Array<{ id: string; staffCode: string; displayName: string }>> {
    const { api } = await import('@/services/api');
    const response = await api.get<Array<{ id: string; staffCode: string; displayName: string }>>('/staff/all');
    return response.data;
  }
};

export default function SalaryResultItemManagement() {
  const {
    data,
    loading,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    refresh,
  } = useSalaryResultItems();

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryResultItem | null>(null);
  const [viewingItem, setViewingItem] = useState<SalaryResultItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SalaryResultItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [salaryResults, setSalaryResults] = useState<Array<{ id: string; name: string }>>([]);
  const [staffList, setStaffList] = useState<Array<{ id: string; staffCode: string; displayName: string }>>([]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [salaryResultsRes, staffRes] = await Promise.all([
        salaryResultApi.getAll(),
        staffApi.getAll()
      ]);
      setSalaryResults(salaryResultsRes.map(r => ({ id: r.id, name: r.name || '' })));
      setStaffList(staffRes);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: SalaryResultItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item: SalaryResultItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (item: SalaryResultItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await salaryResultItemApi.delete(deletingItem.id);
      toast({
        title: "Thành công",
        description: "Đã xóa chi tiết bảng lương thành công",
      });
      refresh();
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chi tiết bảng lương",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await salaryResultItemApi.update(editingItem.id, formData);
        toast({
          title: "Thành công",
          description: "Cập nhật chi tiết bảng lương thành công",
        });
      } else {
        await salaryResultItemApi.create(formData);
        toast({
          title: "Thành công",
          description: "Thêm mới chi tiết bảng lương thành công",
        });
      }
      setIsModalOpen(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const columns: ColumnDef<SalaryResultItem>[] = useMemo(
    () => [
      {
        key: 'actions',
        header: 'Thao tác',
        width: '120px',
        render: (_, row) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Xem">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Sửa">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }} title="Xóa">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      },
      {
        key: 'staff.staffCode',
        header: 'Mã nhân viên',
        sortable: false,
        filterable: true,
        filterType: 'text',
        filterKey: 'staffCode',
        render: (_, row) => row.staff?.staffCode || '-',
      },
      {
        key: 'staff.displayName',
        header: 'Tên nhân viên',
        sortable: false,
        filterable: true,
        filterType: 'text',
        filterKey: 'staffName',
        render: (_, row) => row.staff?.displayName || '-',
      },
      {
        key: 'salaryResult.name',
        header: 'Bảng lương',
        sortable: false,
        filterable: true,
        filterType: 'select',
        filterKey: 'salaryResultId',
        filterOptions: salaryResults.map(r => ({ label: r.name, value: r.id })),
        render: (_, row) => row.salaryResult?.name || '-',
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
    [salaryResults]
  );

  // Mobile Card View
  const renderMobileCard = (item: SalaryResultItem) => (
    <div key={item.id} className="mobile-card">
      <div className="mobile-card-header">
        <div className="flex-1 min-w-0">
          <div className="mobile-card-title">{item.staff?.displayName || '-'}</div>
          <div className="mobile-card-subtitle">{item.staff?.staffCode || '-'}</div>
        </div>
      </div>
      <div className="mobile-card-content">
        <div className="mobile-card-row">
          <span className="mobile-card-label">Bảng lương</span>
          <span className="mobile-card-value">{item.salaryResult?.name || '-'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Ngày tạo</span>
          <span className="mobile-card-value">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}
          </span>
        </div>
      </div>
      <div className="mobile-card-actions">
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(item)} title="Xem">
          <Eye className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleEdit(item)} title="Sửa">
          <Pencil className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-1 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleDeleteClick(item)} title="Xóa">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 md:p-8 md:pt-6">
      <div className="mobile-page-header md:hidden">
        <div className="flex items-center justify-between">
          <h1>Chi Tiết Bảng Lương</h1>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p>Quản lý chi tiết bảng lương của từng nhân viên</p>
      </div>

      <div className="hidden md:block">
        <PageHeader
          title="Chi Tiết Bảng Lương"
          description="Quản lý chi tiết bảng lương của từng nhân viên"
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Thêm mới
              </Button>
            </div>
          }
        />
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 h-10"
                placeholder="Tìm kiếm theo mã hoặc tên nhân viên..."
                value={searchParams.keyword || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select
              value={searchParams.salaryResultId || 'all'}
              onValueChange={(value) => handleFilter({ salaryResultId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-full md:w-[200px] h-10">
                <SelectValue placeholder="Lọc theo bảng lương" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bảng lương</SelectItem>
                {salaryResults.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refresh} className="md:hidden h-10">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMobile ? (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : !data?.content?.length ? (
            <div className="text-center py-8 text-muted-foreground">Không có dữ liệu</div>
          ) : (
            data.content.map(renderMobileCard)
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            sortBy={searchParams.sortBy}
            sortDirection={searchParams.sortDirection}
            onSort={handleSort}
            onFilter={(filters) => handleFilter(filters as Partial<SearchSalaryResultItemDto>)}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      <SalaryResultItemFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={editingItem}
        salaryResults={salaryResults}
        staffList={staffList}
        isLoading={formLoading}
        onSubmit={handleFormSubmit}
      />

      <SalaryResultItemFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        data={viewingItem}
        salaryResults={salaryResults}
        staffList={staffList}
        isLoading={false}
        onSubmit={async () => {}}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa chi tiết bảng lương này?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}