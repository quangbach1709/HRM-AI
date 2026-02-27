import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Pencil, Trash2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalaryResult, SearchSalaryResultDto } from '@/types/salaryResult';
import { useSalaryResults } from '@/hooks/useSalaryResults';
import { SalaryResultFormModal } from '@/components/modals/SalaryResultFormModal';
import { salaryResultApi } from '@/services/salaryResultApi';
import { salaryPeriodApi } from '@/services/salaryPeriodApi';
import { salaryTemplateApi } from '@/services/salaryTemplateApi';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageHeader } from '@/components/ui/page-header';

export default function SalaryResultManagement() {
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
  } = useSalaryResults();

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryResult | null>(null);
  const [viewingItem, setViewingItem] = useState<SalaryResult | null>(null);
  const [deletingItem, setDeletingItem] = useState<SalaryResult | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [salaryPeriods, setSalaryPeriods] = useState<Array<{ id: string; name: string }>>([]);
  const [salaryTemplates, setSalaryTemplates] = useState<Array<{ id: string; name: string }>>([]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [periodsRes, templatesRes] = await Promise.all([
        salaryPeriodApi.getAllList(),
        salaryTemplateApi.getAll()
      ]);
      setSalaryPeriods(periodsRes);
      setSalaryTemplates(templatesRes);
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

  const handleEdit = (item: SalaryResult) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item: SalaryResult) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (item: SalaryResult) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await salaryResultApi.delete(deletingItem.id);
      toast({
        title: "Thành công",
        description: "Đã xóa bảng lương thành công",
      });
      refresh();
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa bảng lương",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await salaryResultApi.update(editingItem.id, formData);
        toast({
          title: "Thành công",
          description: "Cập nhật bảng lương thành công",
        });
      } else {
        await salaryResultApi.create(formData);
        toast({
          title: "Thành công",
          description: "Thêm mới bảng lương thành công",
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

  const columns: ColumnDef<SalaryResult>[] = useMemo(
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
        key: 'name',
        header: 'Tên bảng lương',
        sortable: true,
        sortKey: 'name',
        filterable: true,
        filterType: 'text',
        filterKey: 'name',
      },
      {
        key: 'salaryPeriod.name',
        header: 'Kỳ lương',
        sortable: false,
        filterable: true,
        filterType: 'select',
        filterKey: 'salaryPeriodId',
        filterOptions: salaryPeriods.map(p => ({ label: p.name, value: p.id })),
        render: (_, row) => row.salaryPeriod?.name || '-',
      },
      {
        key: 'salaryTemplate.name',
        header: 'Mẫu lương',
        sortable: false,
        filterable: true,
        filterType: 'select',
        filterKey: 'salaryTemplateId',
        filterOptions: salaryTemplates.map(t => ({ label: t.name, value: t.id })),
        render: (_, row) => row.salaryTemplate?.name || '-',
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
    [salaryPeriods, salaryTemplates]
  );

  // Mobile Card View
  const renderMobileCard = (item: SalaryResult) => (
    <div key={item.id} className="mobile-card">
      <div className="mobile-card-header">
        <div className="flex-1 min-w-0">
          <div className="mobile-card-title">{item.name}</div>
          <div className="mobile-card-subtitle">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}
          </div>
        </div>
      </div>
      <div className="mobile-card-content">
        <div className="mobile-card-row">
          <span className="mobile-card-label">Kỳ lương</span>
          <span className="mobile-card-value">{item.salaryPeriod?.name || '-'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Mẫu lương</span>
          <span className="mobile-card-value">{item.salaryTemplate?.name || '-'}</span>
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
          <h1>Quản lý Bảng Lương</h1>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p>Quản lý danh sách bảng lương tổng hợp</p>
      </div>

      <div className="hidden md:block">
        <PageHeader
          title="Quản lý Bảng Lương"
          description="Quản lý danh sách bảng lương tổng hợp"
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
                placeholder="Tìm kiếm theo tên..."
                value={searchParams.keyword || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
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
            onFilter={(filters) => handleFilter(filters as Partial<SearchSalaryResultDto>)}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      <SalaryResultFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={editingItem}
        salaryPeriods={salaryPeriods}
        salaryTemplates={salaryTemplates}
        isLoading={formLoading}
        onSubmit={handleFormSubmit}
      />

      <SalaryResultFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        data={viewingItem}
        salaryPeriods={salaryPeriods}
        salaryTemplates={salaryTemplates}
        isLoading={false}
        onSubmit={async () => {}}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa bảng lương "${deletingItem?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}