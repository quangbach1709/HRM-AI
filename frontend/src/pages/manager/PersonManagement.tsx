import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { PersonFormModal } from '@/components/modals/PersonFormModal';
import { usePersons } from '@/hooks/usePersons';
import { Person, SearchPersonDto, genderOptions, PersonFormData } from '@/types/person';
import { personApi } from '@/services/personApi';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';

export default function PersonManagement() {
    const [keyword, setKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Person | null>(null);
    const [viewingItem, setViewingItem] = useState<Person | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
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
        refresh,
    } = usePersons();

    const handleKeywordChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setKeyword(value);
            handleSearch(value);
        },
        [handleSearch]
    );

    const handleColumnFilter = useCallback(
        (filters: Record<string, any>) => {
            const processedFilters: any = { ...filters };
            if (filters.gender) processedFilters.gender = parseInt(filters.gender);
            handleFilter(processedFilters as Partial<SearchPersonDto>);
        },
        [handleFilter]
    );

    const handleResetClick = useCallback(() => {
        setKeyword('');
        handleReset();
    }, [handleReset]);

    const handleCreate = useCallback(() => {
        setEditingItem(null);
        setModalMode('create');
        setIsModalOpen(true);
    }, []);

    const handleView = useCallback((item: Person) => {
        setViewingItem(item);
        setModalMode('view');
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((item: Person) => {
        setEditingItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;

        setDeletingId(id);
        try {
            await personApi.delete(id);
            toast({
                title: "Thành công",
                description: "Xóa thành công",
                variant: 'default',
            });
            refresh();
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.message || "Có lỗi xảy ra",
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
        }
    }, [refresh, toast]);

    const handleFormSubmit = async (formData: PersonFormData) => {
        try {
            if (editingItem) {
                if (!editingItem.id) return;
                await personApi.update(editingItem.id, formData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật thành công",
                    variant: 'default',
                });
            } else {
                await personApi.create(formData);
                toast({
                    title: "Thành công",
                    description: "Thêm mới thành công",
                    variant: 'default',
                });
            }
            refresh();
            setIsModalOpen(false);
        } catch (error: any) {
            throw error;
        }
    };

    const columns: ColumnDef<Person>[] = useMemo(
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
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                        </Button>
                    </div>
                ),
            },
            {
                key: 'displayName',
                header: 'Họ và tên',
                sortable: true,
                sortKey: 'displayName',
                filterable: true,
                filterType: 'text',
                filterKey: 'displayName',
            },
            {
                key: 'gender',
                header: 'Giới tính',
                sortable: true,
                sortKey: 'gender',
                filterable: true,
                filterType: 'select',
                filterKey: 'gender',
                filterOptions: genderOptions.map(g => ({ value: g.value.toString(), label: g.label })),
                render: (value) => {
                    const opt = genderOptions.find(g => g.value === value);
                    return opt ? opt.label : value;
                }
            },
            {
                key: 'birthDate',
                header: 'Ngày sinh',
                sortable: true,
                sortKey: 'birthDate',
                render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '',
            },
            {
                key: 'phoneNumber',
                header: 'SĐT',
                sortable: true,
                sortKey: 'phoneNumber',
                filterable: true,
                filterType: 'text',
                filterKey: 'phoneNumber',
            },
            {
                key: 'email',
                header: 'Email',
                sortable: true,
                sortKey: 'email',
                filterable: true,
                filterType: 'text',
                filterKey: 'email',
            },
            {
                key: 'idNumber',
                header: 'CCCD/CMND',
                sortable: true,
                sortKey: 'idNumber',
                filterable: true,
                filterType: 'text',
                filterKey: 'idNumber',
            },
            {
                key: 'createdAt',
                header: 'Ngày tạo',
                sortable: true,
                sortKey: 'createdAt',
                render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '',
            },
        ],
        [handleView, handleEdit, handleDelete]
    );

    return (
        <div className="flex h-full flex-col space-y-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Nhân sự</h2>
                    <p className="text-muted-foreground">
                        Danh sách và thông tin cá nhân
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm mới
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Tìm kiếm theo tên, email, sđt..."
                    value={keyword}
                    onChange={handleKeywordChange}
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
                <Button
                    variant="outline"
                    onClick={handleResetClick}
                >
                    Đặt lại
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-hidden rounded-md border">
                <DataTable<Person>
                    data={data}
                    columns={columns}
                    loading={loading}
                    sortBy={searchParams.sortBy || 'createdAt'}
                    sortDirection={searchParams.sortDirection || 'DESC'}
                    onSort={handleSort}
                    onFilter={handleColumnFilter}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    rowKey="id"
                />
            </div>

            <PersonFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                person={editingItem}
                onSubmit={handleFormSubmit}
                mode={modalMode}
            />

            <PersonFormModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                person={viewingItem}
                onSubmit={async () => {}}
                mode="view"
            />
        </div>
    );
}
