import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, RefreshCw, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@/types/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { useSalaryTemplates } from '@/hooks/useSalaryTemplates';
import { SalaryTemplate, SalaryTemplateFormData } from '@/types/salaryTemplate';
import { salaryTemplateApi } from '@/services/salaryTemplateApi';
import { SalaryTemplateFormModal } from '@/components/modals/SalaryTemplateFormModal';

export function SalaryTemplateManagement() {
    const { toast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SalaryTemplate | null>(null);
    const [viewingItem, setViewingItem] = useState<SalaryTemplate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');

    // Confirm Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SalaryTemplate | null>(null);

    const {
        data,
        loading,
        searchParams,
        handlePageChange,
        handlePageSizeChange,
        handleSort,
        handleFilter,
        handleSearch,
        handleReset,
        refresh,
    } = useSalaryTemplates();

    const handleCreate = () => {
        setEditingItem(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleView = useCallback((item: SalaryTemplate) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = (item: SalaryTemplate) => {
        setEditingItem(item);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDelete = (item: SalaryTemplate) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        // Use existing loading state or a separate one if needed. 
        // Component state 'isSubmitting' is used for form modal, can reuse or create new 'isDeleting'.
        // Let's create a local loading for the dialog if we want to show spinner there, 
        // but for now we'll just await. The ConfirmDialog has isLoading prop.
        // We'll reuse isSubmitting for now or better add isDeleting.

        try {
            await salaryTemplateApi.delete(itemToDelete.id);
            toast({
                title: 'Thành công',
                description: 'Xóa mẫu lương thành công',
            });
            refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Không thể xóa mẫu lương',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleSubmit = async (formData: SalaryTemplateFormData) => {
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await salaryTemplateApi.update(editingItem.id, formData);
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật mẫu lương thành công',
                });
            } else {
                await salaryTemplateApi.create(formData);
                toast({
                    title: 'Thành công',
                    description: 'Tạo mới mẫu lương thành công',
                });
            }
            setModalOpen(false);
            refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = useMemo<ColumnDef<SalaryTemplate>[]>(
        () => [
            {
                key: 'actions',
                header: 'Thao tác',
                render: (_, item) => (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(item); }} title="Xem">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} title="Sửa">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(item); }} title="Xóa">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
            {
                key: 'code',
                header: 'Mã',
                sortable: true,
                sortKey: 'code',
            },
            {
                key: 'name',
                header: 'Tên mẫu lương',
                sortable: true,
                sortKey: 'name',
            },
            {
                key: 'description',
                header: 'Mô tả',
                sortable: true,
                sortKey: 'description',
            },
            {
                key: 'createdAt',
                header: 'Ngày tạo',
                sortable: true,
                sortKey: 'createdAt',
                render: (_, row) => {
                    const date = row.createdAt ? new Date(row.createdAt) : null;
                    return date ? date.toLocaleDateString('vi-VN') : '-';
                },
            },
        ],
        [handleView, handleEdit, handleDelete]
    );

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Mẫu lương</h2>
                    <p className="text-muted-foreground">
                        Danh sách các mẫu bảng lương trong hệ thống
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={refresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                        <Input
                            placeholder="Tìm kiếm theo mã, tên..."
                            value={searchParams.keyword || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                        {searchParams.keyword && (
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="h-8 px-2 lg:px-3"
                            >
                                Đặt lại
                            </Button>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    sortBy={searchParams.sortBy || 'createdAt'}
                    sortDirection={searchParams.sortDirection || 'DESC'}
                    onSort={handleSort}
                    onFilter={handleFilter}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            <SalaryTemplateFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                data={editingItem}
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                mode={modalMode}
            />

            <SalaryTemplateFormModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                data={viewingItem}
                isLoading={false}
                onSubmit={() => { }}
                mode="view"
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa mẫu lương "${itemToDelete?.name}" không? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
