import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, User, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PersonFormModal } from '@/components/modals/PersonFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { personApi } from '@/services/personApi';
import { Person, PersonFormData, SearchPersonDto, defaultSearchPersonDto, genderOptions } from '@/types/person';

export default function PersonManagement() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchPersonDto>(defaultSearchPersonDto);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { toast } = useToast();

  const loadPersons = useCallback(async (params: SearchPersonDto) => {
    try {
      setIsPageLoading(true);
      const response = await personApi.search(params);
      setPersons(response.content);
      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách', variant: 'destructive' });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPersons(searchParams);
  }, [loadPersons, searchParams]);

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
    setSearchParams(defaultSearchPersonDto);
  };

  const handleOpenCreateModal = () => {
    setSelectedPerson(null);
    setIsFormModalOpen(true);
  };

  const handleView = (person: Person) => {
    setViewingPerson(person);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (person: Person) => {
    setSelectedPerson(person);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (person: Person) => {
    setSelectedPerson(person);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: PersonFormData) => {
    setIsLoading(true);
    try {
      if (selectedPerson) {
        await personApi.update(selectedPerson.id, data);
        toast({ title: 'Cập nhật thành công', description: `Thông tin "${data.displayName}" đã được cập nhật.` });
      } else {
        await personApi.create(data);
        toast({ title: 'Thêm mới thành công', description: `"${data.displayName}" đã được tạo.` });
      }
      await loadPersons(searchParams);
      setIsFormModalOpen(false);
      setSelectedPerson(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    setIsLoading(true);
    try {
      await personApi.delete(selectedPerson.id);
      toast({ title: 'Xóa thành công', description: `"${selectedPerson.displayName}" đã được xóa.`, variant: 'destructive' });
      await loadPersons(searchParams);
      setIsDeleteDialogOpen(false);
      setSelectedPerson(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể xóa', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getGenderLabel = (gender: number) => genderOptions.find(g => g.value === gender)?.label || '-';

  if (isPageLoading && persons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý thông tin cá nhân"
        description="Quản lý thông tin cá nhân trong hệ thống"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
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
                placeholder="Tìm kiếm theo tên, email, SĐT, CCCD..."
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
          ) : persons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchKeyword ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}</p>
              {!searchKeyword && (
                <Button className="mt-4" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm mới
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
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CCCD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {persons.map((person, index) => (
                      <TableRow key={person.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex justify-center gap-1">
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                               onClick={() => handleView(person)}
                               aria-label="Xem"
                             >
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                               onClick={() => handleOpenEditModal(person)}
                               aria-label="Sửa"
                             >
                               <Pencil className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                               onClick={() => handleOpenDeleteDialog(person)}
                               aria-label="Xóa"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                        </TableCell>
                        <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium">{person.displayName}</TableCell>
                        <TableCell>
                          <Badge variant={person.gender === 0 ? 'default' : person.gender === 1 ? 'secondary' : 'outline'}>
                            {getGenderLabel(person.gender)}
                          </Badge>
                        </TableCell>
                        <TableCell>{person.phoneNumber || '-'}</TableCell>
                        <TableCell>{person.email || '-'}</TableCell>
                        <TableCell>{person.idNumber || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden p-4 space-y-3">
                {persons.map((person) => (
                  <div key={person.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{person.displayName}</p>
                        <Badge variant={person.gender === 0 ? 'default' : 'secondary'} className="mt-1">
                          {getGenderLabel(person.gender)}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(person)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(person)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(person)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      {person.phoneNumber && <p>SĐT: {person.phoneNumber}</p>}
                      {person.email && <p>Email: {person.email}</p>}
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

      <PersonFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        person={viewingPerson}
        isLoading={false}
        onSubmit={async () => {}}
        mode="view"
      />

      <PersonFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        mode={selectedPerson ? 'edit' : 'create'}
        person={selectedPerson}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa "${selectedPerson?.displayName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
