import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Eye, Pencil, Trash2, RefreshCw, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecruitmentRequestFormModal } from '@/components/modals/RecruitmentRequestFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { recruitmentRequestApi } from '@/services/recruitmentApi';
import { RecruitmentRequest, RecruitmentRequestFormData } from '@/types/recruitment';
import { useRecruitmentRequests } from '@/hooks/useRecruitmentRequests';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';

export default function RecruitmentRequestManagement() {
  const {
    data,
    loading,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleSearch,
    handleFilter,
    handleReset,
    refresh
  } = useRecruitmentRequests();

  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
  const [staff, setStaff] = useState<Array<{ id: string; displayName: string }>>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RecruitmentRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<RecruitmentRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');

  const { toast } = useToast();

  const loadOptions = useCallback(async () => {
    try {
      const [positionsData, staffData] = await Promise.all([
        recruitmentRequestApi.getPositions(),
        recruitmentRequestApi.getStaff(),
      ]);
      setPositions(positionsData);
      setStaff(staffData);
    } catch (e) {
      console.error("Failed to load options", e);
    }
  }, []);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    handleSearch(e.target.value);
  };

  const handleResetClick = () => {
    setKeyword('');
    handleReset();
  };

  const handleOpenCreateModal = async () => {
    setSelectedRequest(null);
    setModalMode('create');
    await loadOptions();
    setIsFormModalOpen(true);
  };

  const handleView = useCallback(async (req: RecruitmentRequest) => {
    setViewingRequest(req);
    await loadOptions();
    setIsViewModalOpen(true);
  }, [loadOptions]);

  const handleOpenEditModal = async (req: RecruitmentRequest) => {
    setSelectedRequest(req);
    setModalMode('edit');
    await loadOptions();
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (req: RecruitmentRequest) => {
    setSelectedRequest(req);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: RecruitmentRequestFormData) => {
    setIsActionLoading(true);
    try {
      if (selectedRequest) {
        await recruitmentRequestApi.update(selectedRequest.id, formData);
        toast({ title: 'Cập nhật thành công', description: `Yêu cầu "${formData.name}" đã được cập nhật.` });
      } else {
        await recruitmentRequestApi.create(formData);
        toast({ title: 'Thêm mới thành công', description: `Yêu cầu "${formData.name}" đã được tạo.` });
      }
      refresh();
      setIsFormModalOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      await recruitmentRequestApi.delete(selectedRequest.id);
      toast({ title: 'Xóa thành công', description: `Yêu cầu "${selectedRequest.name}" đã được xóa.`, variant: 'destructive' });
      refresh();
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể xóa', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<RecruitmentRequest>[]>(() => [
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Xem">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }} title="Sửa">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(row); }} title="Xóa">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      key: 'code',
      header: 'Mã',
      render: (value) => <Badge variant="outline">{value}</Badge>,
      sortable: true,
      sortKey: 'code'
    },
    {
      key: 'name',
      header: 'Tên yêu cầu',
      render: (value) => <span className="font-medium">{value}</span>,
      sortable: true,
      sortKey: 'name'
    },
    {
      key: 'position.name',
      header: 'Vị trí',
      render: (value, row) => row.position?.name || '-'
    },
    {
      key: 'proposer.displayName',
      header: 'Người đề xuất',
      render: (value, row) => row.proposer?.displayName || '-'
    },
    {
      key: 'proposalDate',
      header: 'Ngày đề xuất',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-',
      sortable: true,
      sortKey: 'proposalDate'
    },
  ], [handleView, handleOpenEditModal, handleOpenDeleteDialog]);

  return (
    <div>
      <PageHeader
        title="Yêu cầu tuyển dụng"
        description="Quản lý các yêu cầu tuyển dụng"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetClick}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm yêu cầu
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={handleKeywordChange}
          />
        </div>
      </div>

      <DataTable<RecruitmentRequest>
        data={data}
        columns={columns}
        loading={loading}
        sortBy={searchParams.sortBy}
        sortDirection={searchParams.sortDirection}
        onSort={handleSort}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowKey="id"
      />

      <RecruitmentRequestFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        request={selectedRequest}
        positions={positions}
        staff={staff}
        isLoading={isActionLoading}
        onSubmit={handleFormSubmit}
        mode={modalMode}
      />

      <RecruitmentRequestFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        request={viewingRequest}
        positions={positions}
        staff={staff}
        isLoading={false}
        onSubmit={() => {}}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa yêu cầu"
        description={`Bạn có chắc chắn muốn xóa yêu cầu "${selectedRequest?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isActionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
