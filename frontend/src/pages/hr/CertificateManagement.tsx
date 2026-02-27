import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, Award, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CertificateFormModal } from '@/components/modals/CertificateFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { certificateApi } from '@/services/certificateApi';
import { personApi } from '@/services/personApi';
import { Certificate, CertificateFormData, SearchCertificateDto, defaultSearchCertificateDto } from '@/types/certificate';

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [persons, setPersons] = useState<Array<{ id: string; displayName: string }>>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchCertificateDto>(defaultSearchCertificateDto);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { toast } = useToast();

  const loadCertificates = useCallback(async (params: SearchCertificateDto) => {
    try {
      setIsPageLoading(true);
      const response = await certificateApi.search(params);
      setCertificates(response.content);
      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách chứng chỉ', variant: 'destructive' });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  const loadPersons = async () => {
    const data = await personApi.getAll();
    setPersons(data.map(p => ({ id: p.id, displayName: p.displayName })));
  };

  useEffect(() => {
    loadCertificates(searchParams);
  }, [loadCertificates, searchParams]);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, keyword: searchKeyword || undefined, pageIndex: 0 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setSearchParams(prev => ({ ...prev, pageIndex: newPage }));
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams(prev => ({ ...prev, pageSize: newSize, pageIndex: 0 }));
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchParams(defaultSearchCertificateDto);
  };

  const handleOpenCreateModal = async () => {
    setSelectedCertificate(null);
    await loadPersons();
    setIsFormModalOpen(true);
  };

  const handleView = async (cert: Certificate) => {
    setViewingCertificate(cert);
    await loadPersons();
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = async (cert: Certificate) => {
    setSelectedCertificate(cert);
    await loadPersons();
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CertificateFormData) => {
    setIsLoading(true);
    try {
      if (selectedCertificate) {
        await certificateApi.update(selectedCertificate.id, data);
        toast({ title: 'Cập nhật thành công', description: `Chứng chỉ "${data.name}" đã được cập nhật.` });
      } else {
        await certificateApi.create(data);
        toast({ title: 'Thêm mới thành công', description: `Chứng chỉ "${data.name}" đã được tạo.` });
      }
      await loadCertificates(searchParams);
      setIsFormModalOpen(false);
      setSelectedCertificate(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCertificate) return;
    setIsLoading(true);
    try {
      await certificateApi.delete(selectedCertificate.id);
      toast({ title: 'Xóa thành công', description: `Chứng chỉ "${selectedCertificate.name}" đã được xóa.`, variant: 'destructive' });
      await loadCertificates(searchParams);
      setIsDeleteDialogOpen(false);
      setSelectedCertificate(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể xóa', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý chứng chỉ"
        description="Quản lý chứng chỉ của nhân viên"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm chứng chỉ
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
                placeholder="Tìm kiếm theo tên hoặc mã chứng chỉ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <span>Đang tải...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchKeyword ? 'Không tìm thấy chứng chỉ nào' : 'Chưa có chứng chỉ nào'}</p>
              {!searchKeyword && (
                <Button className="mt-4" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chứng chỉ đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Mã</TableHead>
                      <TableHead>Tên chứng chỉ</TableHead>
                      <TableHead>Người sở hữu</TableHead>
                      <TableHead>Mô tả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert, index) => (
                      <TableRow key={cert.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(cert)} title="Xem">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleOpenEditModal(cert)} title="Sửa">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleOpenDeleteDialog(cert)} title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                        <TableCell><Badge variant="outline">{cert.code}</Badge></TableCell>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell>{cert.person?.displayName || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{cert.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden p-4 space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{cert.name}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">{cert.code}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{cert.person?.displayName}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(cert)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(cert)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(cert)}>
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
              <select value={searchParams.pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
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

      <CertificateFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        certificate={viewingCertificate}
        persons={persons}
        isLoading={false}
        onSubmit={() => {}}
        mode="view"
      />

      <CertificateFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        certificate={selectedCertificate}
        persons={persons}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        mode={selectedCertificate ? 'edit' : 'create'}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa chứng chỉ"
        description={`Bạn có chắc chắn muốn xóa chứng chỉ "${selectedCertificate?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
