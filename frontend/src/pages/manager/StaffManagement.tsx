import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';
import { useStaffs } from '@/hooks/useStaffs';
import { Staff, EmployeeStatusLabel, StaffPhaseLabel } from '@/types/staff';
import { staffApi } from '@/services/staffApi';
import { StaffFormModal } from '@/components/modals/StaffFormModal';

export default function StaffManagement() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Staff | null>(null);
    const [viewingItem, setViewingItem] = useState<Staff | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
    const { toast } = useToast();

    const {
        data,
        loading,
        error,
        searchParams,
        handlePageChange,
        handlePageSizeChange,
        handleSort,
        handleFilter,
        handleSearch,
        handleReset,
        refresh
    } = useStaffs({
        sortBy: 'createdAt',
        sortDirection: 'DESC'
    });

    const handleCreate = () => {
        setEditingItem(null);
        setModalMode('create');
        setIsFormOpen(true);
    };

    const handleView = useCallback((item: Staff) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = (item: Staff) => {
        setEditingItem(item);
        setModalMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = async (item: Staff) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${item.displayName}"?`)) {
            return;
        }

        try {
            await staffApi.delete(item.id);
            toast({
                title: 'Thành công',
                description: 'Xóa nhân viên thành công',
                variant: 'default',
            });
            refresh();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể xóa nhân viên này',
                variant: 'destructive',
            });
        }
    };

    const columns = useMemo<ColumnDef<Staff>[]>(
        () => [
            {
                key: 'actions',
                header: 'Thao tác',
                render: (_, item) => (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); handleView(item); }}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Sửa
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                        </Button>
                    </div>
                ),
            },
            {
                key: 'staffCode',
                header: 'Mã NV',
                sortable: true,
                sortKey: 'staffCode',
                filterable: true,
                filterType: 'text',
                filterKey: 'staffCode',
            },
            {
                key: 'displayName',
                header: 'Tên hiển thị',
                sortable: true,
                sortKey: 'displayName',
                filterable: true,
                filterType: 'text',
                filterKey: 'displayName',
            },
            {
                key: 'email',
                header: 'Email',
                sortable: true,
                sortKey: 'email',
            },
            {
                key: 'employeeStatus',
                header: 'Trạng thái',
                sortable: true,
                sortKey: 'employeeStatus',
                render: (val) => {
                    const label = EmployeeStatusLabel[val as number] || 'Unknown';
                    return <Badge variant="outline">{label}</Badge>;
                }
            },
            {
                key: 'staffPhase',
                header: 'Giai đoạn',
                sortable: true,
                sortKey: 'staffPhase',
                render: (val) => {
                    const label = StaffPhaseLabel[val as number] || 'Unknown';
                    return <Badge variant="secondary">{label}</Badge>;
                }
            },
            {
                key: 'salaryTemplate',
                header: 'Mẫu lương',
                render: (_, row) => row.salaryTemplate?.name || '-',
            },
            {
                key: 'startDate',
                header: 'Ngày bắt đầu',
                sortable: true,
                sortKey: 'startDate',
                render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-',
            },
        ],
        [handleView, handleEdit, handleDelete]
    );

    return (
        <div className="flex h-full flex-col space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Nhân viên</h2>
                    <p className="text-muted-foreground">
                        Danh sách và thông tin chi tiết nhân viên
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm mới
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Tìm kiếm..."
                    value={searchParams.keyword || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={refresh}
                >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Làm mới
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
                    {error}
                </div>
            )}

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

            <StaffFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={refresh}
                editData={editingItem}
                mode={modalMode}
            />

            <StaffFormModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                onSuccess={() => {}}
                editData={viewingItem}
                mode="view"
            />
        </div>
    );
}
