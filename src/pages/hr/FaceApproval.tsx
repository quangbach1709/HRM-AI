import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, UserCircle, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { faceEmbeddingApi } from '@/services/faceEmbeddingApi';
import { personApi } from '@/services/personApi';
import { FaceEmbedding, SearchFaceEmbeddingDto, defaultSearchFaceEmbeddingDto } from '@/types/face-embedding';
import { getFileUrl } from '@/services/fileApi';
import { FaceEmbeddingFormModal, FaceEmbeddingFormData } from '@/components/modals/FaceEmbeddingFormModal';

export default function FaceApproval() {
  const { toast } = useToast();
  const [faceEmbeddings, setFaceEmbeddings] = useState<FaceEmbedding[]>([]);
  const [persons, setPersons] = useState<Array<{ id: string; displayName: string }>>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchFaceEmbeddingDto>(defaultSearchFaceEmbeddingDto);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal/Dialog states
  const [selectedFace, setSelectedFace] = useState<FaceEmbedding | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const loadPersons = async () => {
    try {
      const data = await personApi.getAll();
      setPersons(data.map(p => ({ id: p.id, displayName: p.displayName })));
    } catch (error) {
      console.error('Error loading persons:', error);
    }
  };

  const loadFaceEmbeddings = useCallback(async (params: SearchFaceEmbeddingDto) => {
    try {
      setIsPageLoading(true);
      // Filter by isActive based on tab
      const queryParams = { ...params };
      if (activeTab === 'pending') {
        queryParams.active = false;
      } else if (activeTab === 'approved') {
        queryParams.active = true;
      }
      // 'all' tab doesn't filter by isActive

      const response = await faceEmbeddingApi.search(queryParams);
      setFaceEmbeddings(response.content || []);
      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách', variant: 'destructive' });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast, activeTab]);

  useEffect(() => {
    loadFaceEmbeddings(searchParams);
  }, [loadFaceEmbeddings, searchParams, activeTab]);

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
    setSearchParams(defaultSearchFaceEmbeddingDto);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'approved' | 'all');
    setSearchParams(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleView = async (face: FaceEmbedding) => {
    setSelectedFace(face);
    setModalMode('view');
    await loadPersons();
    setIsFormModalOpen(true);
  };

  const handleEdit = async (face: FaceEmbedding) => {
    setSelectedFace(face);
    setModalMode('edit');
    await loadPersons();
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (face: FaceEmbedding) => {
    setSelectedFace(face);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: FaceEmbeddingFormData) => {
    if (!data.id) return;
    setIsLoading(true);
    try {
      await faceEmbeddingApi.update(data.id, {
        personId: data.personId,
        isActive: data.isActive,
        modelVersion: data.modelVersion,
      });
      toast({ title: 'Cập nhật thành công', description: 'Đã cập nhật thông tin khuôn mặt' });
      setIsFormModalOpen(false);
      loadFaceEmbeddings(searchParams);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể cập nhật', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApprove = async (face: FaceEmbedding) => {
    setIsLoading(true);
    try {
      await faceEmbeddingApi.update(face.id, {
        personId: face.person?.id || '',
        isActive: true,
        modelVersion: face.modelVersion,
      });
      toast({ title: 'Đã duyệt', description: `Đã duyệt khuôn mặt của ${face.person?.displayName}` });
      loadFaceEmbeddings(searchParams);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFace) return;
    setIsLoading(true);
    try {
      await faceEmbeddingApi.delete(selectedFace.id);
      toast({ title: 'Đã xóa', description: 'Đã xóa khuôn mặt thành công' });
      setIsDeleteDialogOpen(false);
      loadFaceEmbeddings(searchParams);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (face: FaceEmbedding) => {
    return face.imageUrl ? getFileUrl(face.imageUrl) : '/placeholder-face.jpg';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <PageHeader
        title="Duyệt khuôn mặt"
        description="Xét duyệt đăng ký khuôn mặt của nhân viên"
        action={
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        }
      />

      <div className="space-y-4 mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên nhân viên..."
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
          ) : faceEmbeddings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchKeyword ? 'Không tìm thấy kết quả' : 'Chưa có yêu cầu đăng ký khuôn mặt nào'}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead className="w-20">Ảnh</TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faceEmbeddings.map((face, index) => (
                      <TableRow key={face.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(face)} title="Xem">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleEdit(face)} title="Sửa">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {!face.active && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50" onClick={() => handleQuickApprove(face)} title="Duyệt nhanh" disabled={isLoading}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleOpenDeleteDialog(face)} title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                        <TableCell>
                          <img
                            src={getImageUrl(face)}
                            alt="Face"
                            className="w-12 h-12 rounded-lg object-cover bg-muted"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{face.person?.displayName || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{face.modelVersion || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(face.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={face.active ? 'default' : 'secondary'}>
                            {face.active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đã duyệt
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Chờ duyệt
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {faceEmbeddings.map((face) => (
                  <div key={face.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start gap-4">
                      <img
                        src={getImageUrl(face)}
                        alt="Face"
                        className="w-16 h-16 rounded-lg object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{face.person?.displayName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(face.createdAt)}</p>
                        <Badge variant={face.active ? 'default' : 'secondary'} className="mt-2">
                          {face.active ? 'Đã duyệt' : 'Chờ duyệt'}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(face)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(face)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(face)}>
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

      {/* View/Edit Form Modal */}
      <FaceEmbeddingFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        face={selectedFace}
        persons={persons}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        mode={modalMode}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa khuôn mặt"
        description={`Bạn có chắc chắn muốn xóa khuôn mặt của "${selectedFace?.person?.displayName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}