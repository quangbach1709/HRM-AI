import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';
import { useSalaryTemplateItems } from '@/hooks/useSalaryTemplateItems'; // Reverted to item hook
import { SalaryTemplateItem, SalaryItemTypeLabel, SalaryItemTypeColor } from '@/types/salaryTemplateItem';
import { salaryTemplateItemApi } from '@/services/salaryTemplateItemApi';
import { SalaryTemplateItemFormModal } from '@/components/modals/SalaryTemplateItemFormModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { salaryTemplateApi } from '@/services/salaryTemplateApi';
import { SalaryTemplate } from '@/types/salaryTemplate';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageHeader } from '@/components/ui/page-header';

export function SalaryTemplateItemManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryTemplateItem | null>(null);
  const [viewingItem, setViewingItem] = useState<SalaryTemplateItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SalaryTemplateItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [salaryTemplates, setSalaryTemplates] = useState<SalaryTemplate[]>([]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const {
    data,
    loading,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    refresh
  } = useSalaryTemplateItems({
    sortBy: 'salaryTemplate.id', // Sort by template first for grouping
    sortDirection: 'ASC'
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await salaryTemplateApi.getAll();
        setSalaryTemplates(templates);
      } catch (error) {
        console.error("Failed to load salary templates", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: SalaryTemplateItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleView = (item: SalaryTemplateItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (item: SalaryTemplateItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await salaryTemplateItemApi.delete(deletingItem.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa mục lương thành công',
      });
      refresh();
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa mục lương này',
        variant: 'destructive',
      });
    }
  };

  const columns = useMemo<ColumnDef<SalaryTemplateItem>[]>(
    () => [
      {
        key: 'actions',
        header: 'Thao tác',
        width: '120px',
        render: (_, item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(item); }} title="Xem">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} title="Sửa">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }} title="Xóa">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
      {
        key: 'displayOrder',
        header: 'TT',
        sortable: true,
        sortKey: 'displayOrder',
        width: '60px',
      },
      {
        key: 'code',
        header: 'Mã',
        sortable: true,
        sortKey: 'code',
        width: '100px',
      },
      {
        key: 'name',
        header: 'Tên mục lương',
        sortable: true,
        sortKey: 'name',
      },
      // Removed Template column as it's now grouped
      {
        key: 'salaryItemType',
        header: 'Loại',
        sortable: true,
        sortKey: 'salaryItemType',
        render: (_, row) => {
          const type = row.salaryItemType;
          const label = SalaryItemTypeLabel[type] || 'Unknown';
          const color = SalaryItemTypeColor[type] || 'default';
          return <Badge variant={color as any}>{label}</Badge>;
        },
      },
      {
        key: 'defaultAmount',
        header: 'Mức mặc định',
        render: (_, row) => row.defaultAmount ? new Intl.NumberFormat('vi-VN').format(row.defaultAmount) : '-',
      },
      {
        key: 'formula',
        header: 'Công thức',
        render: (_, row) => (
          <div className="max-w-[200px] truncate" title={row.formula}>
            {row.formula || '-'}
          </div>
        ),
      },
    ],
    []
  );

  // Mobile Card View
  const renderMobileCard = (item: SalaryTemplateItem) => {
    const type = item.salaryItemType;
    const label = SalaryItemTypeLabel[type] || 'Unknown';
    const color = SalaryItemTypeColor[type] || 'default';

    return (
      <div key={item.id} className="mobile-card">
        <div className="mobile-card-header">
          <div className="flex-1 min-w-0">
            <div className="mobile-card-title">{item.name}</div>
            <div className="mobile-card-subtitle">{item.code}</div>
          </div>
          <Badge variant={color as any}>{label}</Badge>
        </div>
        <div className="mobile-card-content">
          <div className="mobile-card-row">
            <span className="mobile-card-label">Mẫu lương</span>
            <span className="mobile-card-value">{item.salaryTemplate?.name || '-'}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Mức mặc định</span>
            <span className="mobile-card-value">
              {item.defaultAmount ? new Intl.NumberFormat('vi-VN').format(item.defaultAmount) : '-'}
            </span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Thứ tự</span>
            <span className="mobile-card-value">{item.displayOrder}</span>
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
  };

  return (
    <div className="flex h-full flex-col space-y-4 p-4 md:p-8">
      <div className="mobile-page-header md:hidden">
        <div className="flex items-center justify-between">
          <h1>Quản lý mục lương</h1>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p>Thiết lập các khoản lương, phụ cấp, khấu trừ</p>
      </div>

      <div className="hidden md:block">
        <PageHeader
          title="Quản lý mục lương"
          description="Thiết lập các khoản lương, phụ cấp, khấu trừ cho mẫu lương"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo mã, tên..."
                value={searchParams.keyword || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div className="w-full md:w-[250px]">
              <Select
                value={searchParams.salaryTemplateId || 'all'}
                onValueChange={(val) => {
                  const templateId = val === 'all' ? undefined : val;
                  handleFilter({ salaryTemplateId: templateId });
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Lọc theo mẫu lương" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mẫu lương</SelectItem>
                  {salaryTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="shrink-0 h-10"
              onClick={refresh}
            >
              <ArrowUpDown className="md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">Làm mới</span>
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
        <div className="flex-1 overflow-hidden rounded-md border">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            sortBy={searchParams.sortBy || 'salaryTemplate.id'}
            sortDirection={searchParams.sortDirection || 'ASC'}
            onSort={handleSort}
            onFilter={handleFilter}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            groupBy="salaryTemplate.id"
            renderGroupHeader={(value, row) => (
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{row.salaryTemplate?.name}</span>
                <Badge variant="secondary" className="text-xs font-mono">{row.salaryTemplate?.code}</Badge>
              </div>
            )}
          />
        </div>
      )}

      <SalaryTemplateItemFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={refresh}
        editData={editingItem}
      />

      <SalaryTemplateItemFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSuccess={() => { }}
        editData={viewingItem}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa mục lương "${deletingItem?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default SalaryTemplateItemManagement;