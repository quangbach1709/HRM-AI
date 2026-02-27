import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';
import { useSalaryPeriods } from '@/hooks/useSalaryPeriods';
import { SalaryPeriod, SalaryPeriodStatusColor, SalaryPeriodStatusLabel } from '@/types/salaryPeriod';
import { salaryPeriodApi } from '@/services/salaryPeriodApi';
import { SalaryPeriodFormModal } from '@/components/modals/SalaryPeriodFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function SalaryPeriodManagement() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SalaryPeriod | null>(null);
    const [viewingItem, setViewingItem] = useState<SalaryPeriod | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
    const { toast } = useToast();

    // Confirm Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SalaryPeriod | null>(null);

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
    } = useSalaryPeriods();

    const handleCreate = () => {
        setEditingItem(null);
        setModalMode('create');
        setIsFormOpen(true);
    };

    const handleView = useCallback((item: SalaryPeriod) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = (item: SalaryPeriod) => {
        setEditingItem(item);
        setModalMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = (item: SalaryPeriod) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await salaryPeriodApi.delete(itemToDelete.id);
            toast({
                title: 'Thành công',
                description: 'Đã xóa kỳ lương thành công',
                variant: 'default',
            });
            refresh();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể xóa kỳ lương này',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const columns = useMemo<ColumnDef<SalaryPeriod>[]>(
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
                header: 'Tên kỳ lương',
                sortable: true,
                sortKey: 'name',
            },
            {
                key: 'startDate',
                header: 'Bắt đầu',
                sortable: true,
                sortKey: 'startDate',
                render: (_, row) => {
                    return row.startDate ? new Date(row.startDate).toLocaleDateString('vi-VN') : '-';
                },
            },
            {
                key: 'endDate',
                header: 'Kết thúc',
                sortable: true,
                sortKey: 'endDate',
                render: (_, row) => {
                    return row.endDate ? new Date(row.endDate).toLocaleDateString('vi-VN') : '-';
                },
            },
            {
                key: 'estimatedWorkingDays',
                header: 'Công chuẩn',
                sortable: true,
                sortKey: 'estimatedWorkingDays',
            },
            {
                key: 'salaryPeriodStatus',
                header: 'Trạng thái',
                sortable: true,
                sortKey: 'salaryPeriodStatus',
                render: (_, row) => {
                    const status = row.salaryPeriodStatus;
                    const label = SalaryPeriodStatusLabel[status] || 'Unknown';
                    const color = SalaryPeriodStatusColor[status] || 'default';
                    return <Badge variant={color as any}>{label}</Badge>;
                },
            },
        ],
        [handleView, handleEdit, handleDelete]
    );

    return (
        <div className="flex h-full flex-col space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý kỳ lương</h2>
                    <p className="text-muted-foreground">
                        Quản lý danh sách kỳ lương và thiết lập công chuẩn
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm mới
                </Button>
            </div>

            <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Tìm kiếm theo mã, tên..."
                        value={searchParams.keyword || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 lg:flex"
                    onClick={refresh}
                >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Làm mới
                </Button>
            </div>

            <div className="flex-1 overflow-hidden rounded-md border">
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

            <SalaryPeriodFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={refresh}
                editData={editingItem}
                mode={modalMode}
            />

            <SalaryPeriodFormModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                onSuccess={() => { }}
                editData={viewingItem}
                mode="view"
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Xóa kỳ lương"
                description={`Bạn có chắc chắn muốn xóa kỳ lương "${itemToDelete?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default SalaryPeriodManagement;
