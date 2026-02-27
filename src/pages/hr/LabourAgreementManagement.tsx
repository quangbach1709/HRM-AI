import { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, FileSignature, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StaffLabourAgreementFormModal } from '@/components/modals/StaffLabourAgreementFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { staffLabourAgreementApi } from '@/services/staffLabourAgreementApi';
import {
  StaffLabourAgreement,
  StaffLabourAgreementFormData,
  SearchStaffLabourAgreementDto,
  defaultSearchStaffLabourAgreementDto,
  ContractTypeLabel,
  AgreementStatusLabel,
  AgreementStatus
} from '@/types/staffLabourAgreement';
import { useStaffLabourAgreements } from '@/hooks/useStaffLabourAgreements';

export default function LabourAgreementManagement() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<StaffLabourAgreement | null>(null);
  const [viewingAgreement, setViewingAgreement] = useState<StaffLabourAgreement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  // Use the custom hook
  const {
    data,
    loading: isPageLoading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter, // Can be used for status filters
    handleSearch,
    handleReset,
    refresh,
  } = useStaffLabourAgreements();

  // Local state for keyword input to debounce in the hook
  const [keywordInput, setKeywordInput] = useState('');

  const agreements = data?.content || [];
  const pageNumber = data?.pageNumber || 0;
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
    handleSearch(e.target.value);
  };

  const handleOpenCreateModal = useCallback(() => {
    setSelectedAgreement(null);
    setIsFormModalOpen(true);
  }, []);

  const handleView = useCallback((agreement: StaffLabourAgreement) => {
    setViewingAgreement(agreement);
    setIsViewModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((agreement: StaffLabourAgreement) => {
    setSelectedAgreement(agreement);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((agreement: StaffLabourAgreement) => {
    setSelectedAgreement(agreement);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!selectedAgreement) return;
    setDeleteLoading(true);
    try {
      await staffLabourAgreementApi.delete(selectedAgreement.id);
      toast({ title: 'Xóa thành công', description: 'Hợp đồng đã được xóa.', variant: 'destructive' });
      refresh();
      setIsDeleteDialogOpen(false);
      setSelectedAgreement(null);
    } catch (error: unknown) {
      const err = error as Error | undefined;
      toast({ title: 'Lỗi', description: err?.message || 'Không thể xóa', variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  const getStatusVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === AgreementStatus.SIGNED) return 'default';
    if (status === AgreementStatus.UNSIGNED) return 'outline';
    if (status === AgreementStatus.EXPIRED) return 'secondary';
    return 'destructive';
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // If initial loading
  if (isPageLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Hợp đồng lao động"
        description="Quản lý hợp đồng lao động của nhân viên"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setKeywordInput(''); handleReset(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm hợp đồng
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo số hợp đồng..."
                value={keywordInput}
                onChange={handleKeywordChange}
                className="pl-9"
              />
            </div>
            {/* TODO: Add more filters here if needed (status, contract type) */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPageLoading && data ? (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : null}

          {agreements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{keywordInput ? 'Không tìm thấy hợp đồng nào' : 'Chưa có hợp đồng nào'}</p>
              {!keywordInput && (
                <Button className="mt-4" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm hợp đồng đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Loại HĐ</TableHead>
                      <TableHead>Số HĐ</TableHead>
                      <TableHead>Ngày ký</TableHead>
                      <TableHead>Thời hạn</TableHead>
                      <TableHead>Lương</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.map((agreement, index) => (
                      <TableRow key={agreement.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(agreement)} title="Xem">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleOpenEditModal(agreement)} title="Sửa">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleOpenDeleteDialog(agreement)} title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{agreement.staff?.displayName}</p>
                            <p className="text-sm text-muted-foreground">{agreement.staff?.staffCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{ContractTypeLabel[agreement.contractType] || '-'}</TableCell>
                        <TableCell>#{agreement.labourAgreementNumber}</TableCell>
                        <TableCell>{agreement.signedDate ? new Date(agreement.signedDate).toLocaleDateString('vi-VN') : '-'}</TableCell>
                        <TableCell>
                          {agreement.startDate && new Date(agreement.startDate).toLocaleDateString('vi-VN')}
                          {agreement.endDate && ` - ${new Date(agreement.endDate).toLocaleDateString('vi-VN')}`}
                        </TableCell>
                        <TableCell>{agreement.salary ? formatCurrency(agreement.salary) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(agreement.agreementStatus)}>
                            {AgreementStatusLabel[agreement.agreementStatus] || '-'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden p-4 space-y-3">
                {agreements.map((agreement) => (
                  <div key={agreement.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{agreement.staff?.displayName}</p>
                        <p className="text-sm text-muted-foreground">{agreement.staff?.staffCode}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{ContractTypeLabel[agreement.contractType]}</Badge>
                          <Badge variant={getStatusVariant(agreement.agreementStatus)}>
                            {AgreementStatusLabel[agreement.agreementStatus]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-2">{agreement.salary ? formatCurrency(agreement.salary) : '-'}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(agreement)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(agreement)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(agreement)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        {totalElements > 0 && (
          <CardFooter className="flex items-center justify-between border-t p-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <select value={searchParams.pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} className="border rounded px-2 py-1 text-sm bg-background">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-muted-foreground">/ tổng {totalElements} kết quả</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(0)} disabled={pageNumber === 0}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-2">Trang {pageNumber + 1} / {totalPages || 1}</div>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages - 1)} disabled={pageNumber >= totalPages - 1}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <StaffLabourAgreementFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSuccess={() => {}}
        editData={viewingAgreement}
        mode="view"
      />

      <StaffLabourAgreementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        editData={selectedAgreement}
        mode={selectedAgreement ? 'edit' : 'create'}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa hợp đồng"
        description={`Bạn có chắc chắn muốn xóa hợp đồng của "${selectedAgreement?.staff?.displayName || 'nhân viên'}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
