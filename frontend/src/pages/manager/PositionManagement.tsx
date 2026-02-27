import React, { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { usePositions } from '../../hooks/usePositions';
import { Position, SearchPositionDto, PositionFormData } from '../../types/position';
import { ColumnDef } from '../../types/pagination';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { PositionFormModal } from '@/components/modals/PositionFormModal';
import { departmentApi } from '@/services/departmentApi';
import { Department } from '@/types/department';
import { positionApi } from '@/services/positionApi';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function PositionManagement() {
  const [keyword, setKeyword] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [viewingPosition, setViewingPosition] = useState<Position | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { toast } = useToast();

  const {
    data,
    loading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    handleReset,
    refresh,
  } = usePositions();

  // Load all departments for dropdown
  const loadAllDepartments = useCallback(async () => {
    try {
      if (allDepartments.length === 0) {
        const departments = await departmentApi.getAll();
        setAllDepartments(departments);
      }
    } catch (error) {
      console.error('Failed to load departments', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phòng ban',
        variant: 'destructive',
      });
    }
  }, [allDepartments.length, toast]);

  // Open Edit Modal
  const handleOpenEditModal = (position: Position) => {
    setSelectedPosition(position);
    loadAllDepartments();
    setIsFormModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedPosition(null);
    loadAllDepartments();
    setIsFormModalOpen(true);
  };

  // Open View Modal
  const handleView = useCallback((position: Position) => {
    setViewingPosition(position);
    loadAllDepartments();
    setIsViewModalOpen(true);
  }, [loadAllDepartments]);

  // Open Delete Dialog
  const handleOpenDeleteDialog = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData: PositionFormData) => {
    setIsActionLoading(true);
    try {
      if (selectedPosition) {
        await positionApi.update(selectedPosition.id, formData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật vị trí thành công',
        });
      } else {
        await positionApi.create(formData);
        toast({
          title: 'Thành công',
          description: 'Thêm mới vị trí thành công',
        });
      }
      setIsFormModalOpen(false);
      refresh();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedPosition) return;
    setIsActionLoading(true);
    try {
      await positionApi.delete(selectedPosition.id);
      toast({
        title: 'Thành công',
        description: 'Xóa vị trí thành công',
      });
      setIsDeleteDialogOpen(false);
      refresh();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
      handleSearch(e.target.value);
    },
    [handleSearch]
  );

  const handleColumnFilter = useCallback(
    (filters: Record<string, any>) => {
      handleFilter(filters as Partial<SearchPositionDto>);
    },
    [handleFilter]
  );

  const handleRowClick = useCallback((item: Position) => {
    // Optional details view
    console.log('Row clicked', item);
  }, []);

  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  // Define columns here to access actions - ACTIONS FIRST
  const columns: ColumnDef<Position>[] = [
    {
      key: 'actions',
      header: 'Thao tác',
      width: '160px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Xem">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }} title="Sửa">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(row); }} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
    {
      key: 'code',
      header: 'Mã vị trí',
      sortable: true,
      sortKey: 'code',
      filterable: true,
      filterType: 'text',
      filterKey: 'code',
      width: '120px',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'name',
      header: 'Tên vị trí',
      sortable: true,
      sortKey: 'name',
      filterable: true,
      filterType: 'text',
      filterKey: 'name',
      width: '200px',
    },
    {
      key: 'department.name',
      header: 'Phòng ban',
      sortable: false,
      filterable: false,
      width: '200px',
      render: (value) => value || <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'isMain',
      header: 'Chính/Phụ',
      sortable: true,
      sortKey: 'isMain',
      filterable: true,
      filterType: 'boolean',
      filterKey: 'isMain',
      width: '120px',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Chính' : 'Phụ'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      sortKey: 'createdAt',
      width: '150px',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Vị trí"
        description="Quản lý danh sách vị trí công việc"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetClick}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button className="touch-target" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm vị trí
            </Button>
          </div>
        }
      />

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4 flex justify-between items-center">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>Thử lại</Button>
        </div>
      )}

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap items-center">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã vị trí..."
                value={keyword}
                onChange={handleKeywordChange}
                className="pl-9"
              />
            </div>
            <Button variant="secondary" onClick={() => handleSearch(keyword)}>
              Tìm kiếm
            </Button>
            <Button variant="ghost" onClick={handleResetClick}>
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable<Position>
            data={data}
            columns={columns}
            loading={loading}
            sortBy={searchParams.sortBy || 'createdAt'}
            sortDirection={searchParams.sortDirection || 'DESC'}
            onSort={handleSort}
            onFilter={handleColumnFilter}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowClick={handleRowClick}
            rowKey="id"
          />
        </CardContent>
      </Card>

      <PositionFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        position={selectedPosition}
        allDepartments={allDepartments}
        isLoading={isActionLoading}
        onSubmit={handleFormSubmit}
      />

      {/* View Modal */}
      <PositionFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        position={viewingPosition}
        allDepartments={allDepartments}
        isLoading={false}
        onSubmit={() => {}}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa vị trí "${selectedPosition?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isActionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
