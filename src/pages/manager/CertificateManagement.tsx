import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, Search, RotateCcw } from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateFormModal } from '@/components/modals/CertificateFormModal';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { certificateApi } from '@/services/certificateApi';
import { personApi } from '@/services/personApi';
import { Certificate, CertificateFormData } from '@/types/certificate';
import { Person } from '@/types/person';
import { ColumnDef } from '@/types/pagination';

export function CertificateManagement() {
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
    } = useCertificates();

    const [keyword, setKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [persons, setPersons] = useState<Person[]>([]);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');

    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const result = await personApi.getAll();
                setPersons(result);
            } catch (error) {
                console.error('Failed to fetch persons:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải danh sách nhân viên',
                    variant: 'destructive',
                });
            }
        };
        fetchPersons();
    }, [toast]);

    const handleCreate = () => {
        setSelectedCertificate(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleView = useCallback((certificate: Certificate) => {
        setViewingCertificate(certificate);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) return;

        try {
            await certificateApi.delete(id);
            toast({
                title: 'Thành công',
                description: 'Xóa chứng chỉ thành công',
            });
            refresh();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra khi xóa',
                variant: 'destructive',
            });
        }
    };

    const handleModalSubmit = async (data: CertificateFormData) => {
        setIsSubmitting(true);
        try {
            if (data.id) {
                await certificateApi.update(data.id, data);
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật thành công',
                });
            } else {
                await certificateApi.create(data);
                toast({
                    title: 'Thành công',
                    description: 'Tạo mới thành công',
                });
            }
            setIsModalOpen(false);
            refresh();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnDef<Certificate>[] = useMemo(
        () => [
            {
                key: 'actions',
                header: 'Thao tác',
                render: (_, row) => (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); handleView(row); }}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                        >
                            <Pencil className="h-4 w-4 mr-1" />
                            Sửa
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
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
                header: 'Tên chứng chỉ',
                sortable: true,
                sortKey: 'name',
            },
            {
                key: 'person.displayName',
                header: 'Người sở hữu',
                sortable: false,
                render: (_, row) => row.person?.displayName || '-',
            },
            {
                key: 'createdAt',
                header: 'Ngày tạo',
                sortable: true,
                sortKey: 'createdAt',
                render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
            },
        ],
        [handleView, handleEdit, handleDelete]
    );

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        handleSearch(e.target.value);
    };

    return (
        <div className="space-y-6 p-6 pb-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý Chứng chỉ</h1>
                    <p className="text-sm text-muted-foreground">
                        Quản lý danh sách bằng cấp, chứng chỉ của nhân viên
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm mới
                </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm theo tên, mã..."
                        value={keyword}
                        onChange={handleKeywordChange}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" onClick={handleReset} title="Đặt lại bộ lọc">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Đặt lại
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <DataTable
                    data={data}
                    columns={columns}
                    loading={loading}
                    sortBy={searchParams.sortBy}
                    sortDirection={searchParams.sortDirection}
                    onSort={handleSort}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onFilter={(filters) => handleFilter(filters)}
                    rowKey="id"
                />
            </div>

            <CertificateFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                certificate={selectedCertificate}
                persons={persons}
                isLoading={isSubmitting}
                onSubmit={handleModalSubmit}
                mode={modalMode}
            />

            <CertificateFormModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                certificate={viewingCertificate}
                persons={persons}
                isLoading={false}
                onSubmit={() => {}}
                mode="view"
            />
        </div>
    );
}
