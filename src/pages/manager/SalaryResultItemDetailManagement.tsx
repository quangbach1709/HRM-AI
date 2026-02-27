import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, RefreshCw, Search, Eye, Calculator, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalaryResultItemDetail, SearchSalaryResultItemDetailDto } from '@/types/salaryResultItemDetail';
import { useSalaryResultItemDetails } from '@/hooks/useSalaryResultItemDetails'; // REVERT TO DETAILS HOOK
import { SalaryResultItemDetailFormModal } from '@/components/modals/SalaryResultItemDetailFormModal';
import { CalculateSalaryModal } from '@/components/modals/CalculateSalaryModal';
import { SendSalaryEmailModal } from '@/components/modals/SendSalaryEmailModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { salaryResultItemDetailApi } from '@/services/salaryResultItemDetailApi';
import { salaryResultItemApi } from '@/services/salaryResultItemApi';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Import salaryTemplateItemApi
const salaryTemplateItemApi = {
    async getAll(): Promise<Array<{ id: string; name: string; code?: string }>> {
        const { api } = await import('@/services/api');
        const response = await api.get<Array<{ id: string; name: string; code?: string }>>('/salary-template-items/all');
        return response.data;
    }
};

export default function SalaryResultItemDetailManagement() {
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
        refresh,
    } = useSalaryResultItemDetails();

    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SalaryResultItemDetail | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [viewingItem, setViewingItem] = useState<SalaryResultItemDetail | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<SalaryResultItemDetail | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Calculate salary modal
    const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);

    // Send email modal
    const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);

    // Dropdown data
    const [salaryResultItems, setSalaryResultItems] = useState<Array<{ id: string; staffCode?: string; displayName?: string }>>([]);
    const [salaryTemplateItems, setSalaryTemplateItems] = useState<Array<{ id: string; name: string; code?: string }>>([]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [resultItemsRes, templateItemsRes] = await Promise.all([
                salaryResultItemApi.getAll(),
                salaryTemplateItemApi.getAll()
            ]);
            setSalaryResultItems(resultItemsRes.map(r => ({
                id: r.id,
                staffCode: r.staff?.staffCode,
                displayName: r.staff?.displayName
            })));
            setSalaryTemplateItems(templateItemsRes);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách dữ liệu",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: SalaryResultItemDetail) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleView = (item: SalaryResultItemDetail) => {
        setViewingItem(item);
        setIsViewModalOpen(true);
    };

    const handleOpenDeleteDialog = (item: SalaryResultItemDetail) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingItem) return;

        setDeleteLoading(true);
        try {
            await salaryResultItemDetailApi.delete(deletingItem.id);
            toast({
                title: "Thành công",
                description: "Đã xóa chi tiết khoản lương thành công",
            });
            setIsDeleteDialogOpen(false);
            setDeletingItem(null);
            refresh();
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Không thể xóa chi tiết khoản lương",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFormSubmit = async (formData: any) => {
        setFormLoading(true);
        try {
            if (editingItem) {
                await salaryResultItemDetailApi.update(editingItem.id, formData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật chi tiết khoản lương thành công",
                });
            } else {
                await salaryResultItemDetailApi.create(formData);
                toast({
                    title: "Thành công",
                    description: "Thêm mới chi tiết khoản lương thành công",
                });
            }
            setIsModalOpen(false);
            refresh();
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleCalculateSalarySuccess = () => {
        toast({
            title: "Thành công",
            description: "Tính lương thành công! Dữ liệu đã được cập nhật.",
        });
        refresh();
        fetchDropdownData();
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Các mã không phải tiền tệ (số ngày công, số lượng...)
    const nonCurrencyCodes = ['SO_NGAY_CONG_THUC_TE', 'SO_NGAY_CONG_TIEU_CHUAN'];

    const formatValue = (value: number | undefined, code?: string) => {
        if (value === undefined || value === null) return '-';

        if (code && nonCurrencyCodes.includes(code)) {
            // Hiển thị như số lượng (ngày công)
            return new Intl.NumberFormat('vi-VN', {
                maximumFractionDigits: 2,
            }).format(value) + ' ngày';
        }

        // Hiển thị như tiền tệ
        return formatCurrency(value);
    };

    const columns: ColumnDef<SalaryResultItemDetail>[] = useMemo(
        () => [
            {
                key: 'actions',
                header: 'Thao tác',
                width: '120px',
                render: (_, row) => (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Xem">
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Sửa">
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(row); }} title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )
            },
            {
                key: 'salaryTemplateItem.displayOrder',
                header: 'TT',
                sortable: true,
                sortKey: 'salaryTemplateItem.displayOrder',
                width: '60px',
                render: (_, row) => row.salaryTemplateItem?.displayOrder || '-',
            },
            {
                key: 'salaryTemplateItem.code',
                header: 'Mã',
                sortable: false,
                render: (_, row) => <span className="font-mono text-xs">{row.salaryTemplateItem?.code || '-'}</span>,
            },
            {
                key: 'salaryTemplateItem.name',
                header: 'Thành phần lương',
                sortable: false,
                filterable: true,
                filterType: 'select',
                filterKey: 'salaryTemplateItemId',
                filterOptions: salaryTemplateItems.map(t => ({ label: t.name, value: t.id })),
                render: (_, row) => row.salaryTemplateItem?.name || '-',
            },
            {
                key: 'value',
                header: 'Giá trị',
                sortable: true,
                sortKey: 'value',
                render: (val, row) => <span className="font-mono font-medium">{formatValue(val as number, row.salaryTemplateItem?.code)}</span>,
                width: '150px',
            },
            {
                key: 'createdAt',
                header: 'Ngày tạo',
                sortable: true,
                sortKey: 'createdAt',
                render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
                width: '120px',
            },
        ],
        [salaryTemplateItems]
    );

    return (
        <div className="space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chi Tiết Khoản Lương</h2>
                    <p className="text-muted-foreground">
                        Quản lý chi tiết từng khoản lương của nhân viên
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setIsCalculateModalOpen(true)}
                    >
                        <Calculator className="mr-2 h-4 w-4" />
                        Tính lương
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        onClick={() => setIsSendEmailModalOpen(true)}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Gửi Email
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-8"
                        placeholder="Tìm kiếm theo thành phần lương..."
                        value={searchParams.keyword || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={searchParams.salaryTemplateItemId || 'all'}
                    onValueChange={(value) => handleFilter({ salaryTemplateItemId: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Thành phần lương" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả thành phần</SelectItem>
                        {salaryTemplateItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <DataTable
                    data={data}
                    columns={columns}
                    loading={loading}
                    sortBy={searchParams.sortBy}
                    sortDirection={searchParams.sortDirection}
                    onSort={handleSort}
                    onFilter={(filters) => handleFilter(filters as Partial<SearchSalaryResultItemDetailDto>)}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onRowClick={handleView}
                    groupBy="salaryResultItem.id" // Group by Parent Item
                    renderGroupHeader={(value, row) => (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{row.salaryResultItem?.staff?.staffCode}</Badge>
                            <span className="font-bold text-base">{row.salaryResultItem?.staff?.displayName}</span>
                            <span className="text-muted-foreground text-sm mx-2">•</span>
                            <span className="text-sm">{row.salaryResultItem?.salaryResult?.name}</span>
                        </div>
                    )}
                />
            </div>

            <SalaryResultItemDetailFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                data={editingItem}
                salaryResultItems={salaryResultItems}
                salaryTemplateItems={salaryTemplateItems}
                isLoading={formLoading}
                onSubmit={handleFormSubmit}
            />

            <SalaryResultItemDetailFormModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                data={viewingItem}
                salaryResultItems={salaryResultItems}
                salaryTemplateItems={salaryTemplateItems}
                mode="view"
                onSubmit={async () => { }}
            />

            {/* Calculate Salary Modal */}
            <CalculateSalaryModal
                open={isCalculateModalOpen}
                onOpenChange={setIsCalculateModalOpen}
                onSuccess={handleCalculateSalarySuccess}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Xác nhận xóa"
                description={`Bạn có chắc chắn muốn xóa chi tiết khoản lương này? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="destructive"
                isLoading={deleteLoading}
                onConfirm={handleDelete}
            />

            {/* Send Email Modal */}
            <SendSalaryEmailModal
                open={isSendEmailModalOpen}
                onOpenChange={setIsSendEmailModalOpen}
            />
        </div>
    );
}
