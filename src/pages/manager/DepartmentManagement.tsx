import { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronRight, Eye, Pencil, Trash2, Users, Building2, Loader2, RefreshCw, Search, ChevronLeft, ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DepartmentFormModal } from '@/components/modals/DepartmentFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { departmentApi } from '@/services/departmentApi';
import { Department, DepartmentFormData, SearchDepartmentDto, defaultSearchDepartmentDto, SortDirection } from '@/types/department';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Search params state
  const [searchParams, setSearchParams] = useState<SearchDepartmentDto>(defaultSearchDepartmentDto);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Pagination State
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load departments with specification pattern
  const loadDepartments = useCallback(async (params: SearchDepartmentDto) => {
    try {
      setIsPageLoading(true);

      const response = await departmentApi.search(params);

      setDepartments(response.content);
      setPageNumber(response.pageNumber);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách phòng ban',
        variant: 'destructive',
      });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  // Lazy load all departments for parent selection
  const loadAllDepartments = async () => {
    try {
      const all = await departmentApi.getAll();
      setAllDepartments(all);
    } catch (error: any) {
      console.error('Failed to load all departments:', error);
    }
  };

  useEffect(() => {
    loadDepartments(searchParams);
  }, [loadDepartments, searchParams]);

  // === HANDLERS ===

  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      keyword: searchKeyword || undefined,
      pageIndex: 0,
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (sortBy: string) => {
    setSearchParams(prev => {
      const newDirection: SortDirection =
        prev.sortBy === sortBy && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC';
      return {
        ...prev,
        sortBy,
        sortDirection: newDirection,
        pageIndex: 0,
      };
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setSearchParams(prev => ({ ...prev, pageIndex: newPage }));
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams(prev => ({
      ...prev,
      pageSize: newSize,
      pageIndex: 0,
    }));
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchParams(defaultSearchDepartmentDto);
  };

  const handleOpenCreateModal = () => {
    setSelectedDepartment(null);
    loadAllDepartments();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setSelectedDepartment(department);
    loadAllDepartments();
    setIsFormModalOpen(true);
  };

  const handleView = (department: Department) => {
    setViewingDepartment(department);
    loadAllDepartments();
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: DepartmentFormData) => {
    setIsLoading(true);

    try {
      if (selectedDepartment) {
        await departmentApi.update(selectedDepartment.id, data);
        toast({
          title: 'Cập nhật thành công',
          description: `Phòng ban "${data.name}" đã được cập nhật.`,
        });
      } else {
        await departmentApi.create(data);
        toast({
          title: 'Thêm mới thành công',
          description: `Phòng ban "${data.name}" đã được tạo.`,
        });
      }

      await loadDepartments(searchParams);
      setIsFormModalOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    setIsLoading(true);

    try {
      await departmentApi.delete(selectedDepartment.id);

      toast({
        title: 'Xóa thành công',
        description: `Phòng ban "${selectedDepartment.name}" đã được xóa.`,
        variant: 'destructive',
      });

      await loadDepartments(searchParams);
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa phòng ban',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sort Icon Component
  const SortIcon = ({ column }: { column: string }) => {
    if (searchParams.sortBy !== column) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return searchParams.sortDirection === 'ASC'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  // Action Buttons Component
  const ActionButtons = ({ department }: { department: Department }) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(department); }} title="Xem">
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(department); }} title="Sửa">
        <Pencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(department); }} title="Xóa">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  function DepartmentNode({ department, level = 0 }: { department: Department; level?: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = department.subRows && department.subRows.length > 0;

    return (
      <div className={level > 0 ? 'ml-4 md:ml-8 border-l-2 border-border pl-2 md:pl-4' : ''}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors mb-2">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              {hasChildren && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </Button>
                </CollapsibleTrigger>
              )}
              {!hasChildren && <div className="w-8 shrink-0" />}
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--manager-accent))]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[hsl(var(--manager-accent))]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm md:text-base truncate">{department.name}</h3>
                  {department.code && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {department.code}
                    </Badge>
                  )}
                </div>
                {department.description && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{department.description}</p>
                )}
                {department.positionManager?.staff && (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Trưởng phòng: {department.positionManager.staff.displayName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {department.positions && !isMobile && (
                <Badge variant="secondary" className="hidden sm:flex">
                  <Users className="w-3 h-3 mr-1" />
                  {department.positions.length}
                </Badge>
              )}
              <ActionButtons department={department} />
            </div>
          </div>
          {hasChildren && (
            <CollapsibleContent className="animate-accordion-down">
              {department.subRows!.map((child) => (
                <DepartmentNode key={child.id} department={child} level={level + 1} />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  }

  if (isPageLoading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mobile-page-header md:hidden">
        <div className="flex items-center justify-between">
          <h1>Quản lý phòng ban</h1>
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p>Quản lý cơ cấu tổ chức</p>
      </div>

      <div className="hidden md:block">
        <PageHeader
          title="Quản lý phòng ban"
          description="Quản lý cơ cấu tổ chức"
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button className="touch-target" onClick={handleOpenCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm phòng ban
              </Button>
            </div>
          }
        />
      </div>

      <Card className="mb-4">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2 md:flex-wrap">
            {/* Search Box */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 md:flex-none h-10">
                <Search className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Tìm kiếm</span>
              </Button>
              <Button variant="outline" onClick={handleReset} className="md:hidden h-10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Buttons - Hidden on mobile */}
            <div className="hidden md:flex gap-1 items-center">
              <span className="text-sm text-muted-foreground mr-2">Sắp xếp:</span>
              <Button
                variant={searchParams.sortBy === 'name' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleSort('name')}
              >
                Tên <SortIcon column="name" />
              </Button>
              <Button
                variant={searchParams.sortBy === 'code' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleSort('code')}
              >
                Mã <SortIcon column="code" />
              </Button>
              <Button
                variant={searchParams.sortBy === 'createdAt' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleSort('createdAt')}
              >
                Ngày tạo <SortIcon column="createdAt" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-6">
          {isPageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <span>Đang tải...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchKeyword ? 'Không tìm thấy phòng ban nào' : 'Chưa có phòng ban nào'}</p>
              {!searchKeyword && (
                <Button className="mt-4" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm phòng ban đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {departments.map((department) => (
                <DepartmentNode key={department.id} department={department} />
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination Controls */}
        {totalElements > 0 && (
          <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t p-3 md:p-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <select
                value={searchParams.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1.5 text-sm bg-background"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-muted-foreground">
                / {totalElements}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={pageNumber === 0}
                className="h-9 w-9 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 0}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-2 min-w-[80px] text-center">
                {pageNumber + 1} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages - 1}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={pageNumber >= totalPages - 1}
                className="h-9 w-9 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <DepartmentFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        department={selectedDepartment}
        allDepartments={allDepartments}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
      />

      {/* View Modal */}
      <DepartmentFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        department={viewingDepartment}
        allDepartments={allDepartments}
        isLoading={false}
        onSubmit={async () => {}}
        mode="view"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa phòng ban"
        description={`Bạn có chắc chắn muốn xóa phòng ban "${selectedDepartment?.name}"? Các phòng ban con cũng sẽ bị xóa. Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}