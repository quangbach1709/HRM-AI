import React, { useState, useCallback, useMemo } from 'react';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { useStaffWorkSchedules } from '../../hooks/useStaffWorkSchedules';
import { StaffWorkSchedule } from '../../types/staffWorkSchedule';
import { staffWorkScheduleApi } from '../../services/staffWorkScheduleApi';
import { StaffWorkScheduleFormModal } from '../../components/modals/StaffWorkScheduleFormModal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { ColumnDef } from '../../types/pagination';
import { Eye, Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';

// Constants matching backend HRConstants
const SHIFT_WORK_TYPES: Record<number, string> = {
    1: 'Ca sáng',
    2: 'Ca chiều',
    3: 'Ca nguyên ngày',
};

const SHIFT_WORK_STATUSES: Record<number, string> = {
    1: 'Khởi tạo',
    2: 'Đã check in',
    3: 'Đi làm thiếu giờ',
    4: 'Đi làm đủ giờ',
    5: 'Nghỉ',
    6: 'Chưa đến ngày làm việc',
};

export default function StaffWorkScheduleManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StaffWorkSchedule | null>(null);
    const [viewingItem, setViewingItem] = useState<StaffWorkSchedule | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<StaffWorkSchedule | null>(null);
    const { toast } = useToast();

    const {
        data,
        loading,
        searchParams,
        handlePageChange,
        handlePageSizeChange,
        handleSort,
        handleSearch,
        handleReset,
        refresh
    } = useStaffWorkSchedules();

    const handleView = (item: StaffWorkSchedule) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    };

    // Definitions
    const columns = useMemo<ColumnDef<StaffWorkSchedule>[]>(() => [
        {
            key: 'actions',
            header: 'Thao tác',
            render: (_, row: StaffWorkSchedule) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(row)} title="Xem">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleEdit(row)} title="Sửa">
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleDeleteClick(row)} title="Xóa">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        },
        {
            key: 'staff.displayName',
            header: 'Nhân viên',
            render: (value, row) => value || row.staff?.staffCode || '-',
        },
        {
            key: 'checkIn',
            header: 'Giờ check in',
            render: (value) => value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
        },
        {
            key: 'checkOut',
            header: 'Giờ check out',
            render: (value) => value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
        },
        {
            key: 'shiftWorkType',
            header: 'Loại ca',
            render: (value) => SHIFT_WORK_TYPES[value as number] || '-',
        },
        {
            key: 'shiftWorkStatus',
            header: 'Trạng thái',
            render: (value) => SHIFT_WORK_STATUSES[value as number] || '-',
        },
    ], []);

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: StaffWorkSchedule) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: StaffWorkSchedule) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await staffWorkScheduleApi.delete(itemToDelete.id);
            toast({ title: 'Xóa thành công', variant: 'default' });
            refresh();
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch (err: any) {
            toast({ title: 'Lỗi khi xóa', description: err.message || 'Có lỗi xảy ra', variant: 'destructive' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Phân Ca (StaffWorkSchedule)</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Button>
            </div>

            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm..."
                    value={searchParams.keyword || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="ghost" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
            </div>

            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={data}
                    // pageCount not used in this DataTable interface? 
                    // Reading props: onPageChange, onPageSizeChange, sortBy, sortDirection, onFilter, onSort
                    loading={loading}
                    sortBy={searchParams.sortBy || 'createdAt'}
                    sortDirection={searchParams.sortDirection || 'DESC'}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSort={handleSort}
                    onFilter={(filters) => {
                        // Implementation for filter if needed, typically passed from hook
                        // For now pass empty/noop or handleFilter
                        // The hook has handleFilter(Partial<Dto>)
                        // DataTable calls onFilter(Record<string, any>)
                        console.log('Filter', filters);
                    }}
                />
            </div>

            <StaffWorkScheduleFormModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                onSuccess={() => { }}
                editData={viewingItem}
                mode="view"
            />

            <StaffWorkScheduleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refresh}
                editData={editingItem}
                mode={editingItem ? 'edit' : 'create'}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Xác nhận xóa phân ca"
                description={`Bạn có chắc chắn muốn xóa phân ca của nhân viên "${itemToDelete?.staff?.displayName || itemToDelete?.staff?.staffCode}" vào ngày ${itemToDelete?.workingDate ? new Date(itemToDelete.workingDate).toLocaleDateString('vi-VN') : ''}?`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="destructive"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
