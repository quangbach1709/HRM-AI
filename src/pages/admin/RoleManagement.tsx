import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, Shield, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleFormModal } from '@/components/modals/RoleFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { roleApi } from '@/services/roleApi';
import { Role, RoleFormData, SearchRoleDto, defaultSearchRoleDto } from '@/types/role';

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchRoleDto>(defaultSearchRoleDto);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { toast } = useToast();

  const loadRoles = useCallback(async (params: SearchRoleDto) => {
    try {
      setIsPageLoading(true);
      const response = await roleApi.search(params);
      setRoles(response.content);
      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách vai trò', variant: 'destructive' });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRoles(searchParams);
  }, [loadRoles, searchParams]);

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
    setSearchParams(defaultSearchRoleDto);
  };

  const handleOpenCreateModal = () => {
    setSelectedRole(null);
    setIsFormModalOpen(true);
  };

  const handleView = (role: Role) => {
    setViewingRole(role);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    setIsLoading(true);
    try {
      if (selectedRole) {
        await roleApi.update(selectedRole.id, data);
        toast({ title: 'Cập nhật thành công', description: `Vai trò "${data.name}" đã được cập nhật.` });
      } else {
        await roleApi.create(data);
        toast({ title: 'Thêm mới thành công', description: `Vai trò "${data.name}" đã được tạo.` });
      }
      await loadRoles(searchParams);
      setIsFormModalOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await roleApi.delete(selectedRole.id);
      toast({ title: 'Xóa thành công', description: `Vai trò "${selectedRole.name}" đã được xóa.`, variant: 'destructive' });
      await loadRoles(searchParams);
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể xóa vai trò', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý vai trò"
        description="Quản lý các vai trò và quyền hạn trong hệ thống"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm vai trò
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
                placeholder="Tìm kiếm theo tên vai trò..."
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
          ) : roles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchKeyword ? 'Không tìm thấy vai trò nào' : 'Chưa có vai trò nào'}</p>
              {!searchKeyword && (
                <Button className="mt-4" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm vai trò đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Tên vai trò</TableHead>
                      <TableHead>Mô tả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role, index) => (
                      <TableRow key={role.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(role)} title="Xem">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleOpenEditModal(role)} title="Sửa">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleOpenDeleteDialog(role)} title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{role.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{role.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(role)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(role)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(role)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
                    )}
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

      <RoleFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        role={viewingRole}
        isLoading={false}
        onSubmit={() => {}}
        mode="view"
      />

      <RoleFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        role={selectedRole}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        mode={selectedRole ? 'edit' : 'create'}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò "${selectedRole?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
