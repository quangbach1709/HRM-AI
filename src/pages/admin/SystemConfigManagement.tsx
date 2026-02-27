import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, Settings, Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SystemConfigFormModal } from '@/components/modals/SystemConfigFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { systemConfigApi } from '@/services/systemConfigApi';
import { SystemConfig, SystemConfigFormData, SearchSystemConfigDto, defaultSearchSystemConfigDto, getConfigTypeName } from '@/types/system-config';

export default function SystemConfigManagement() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
    const [viewingConfig, setViewingConfig] = useState<SystemConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<SearchSystemConfigDto>(defaultSearchSystemConfigDto);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const { toast } = useToast();

    const loadConfigs = useCallback(async (params: SearchSystemConfigDto) => {
        try {
            setIsPageLoading(true);
            const response = await systemConfigApi.search(params);
            setConfigs(response.content);
            setPageNumber(response.pageNumber);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message || 'Không thể tải danh sách cấu hình', variant: 'destructive' });
        } finally {
            setIsPageLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadConfigs(searchParams);
    }, [loadConfigs, searchParams]);

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
        setSearchParams(defaultSearchSystemConfigDto);
    };

    const handleOpenCreateModal = () => {
        setSelectedConfig(null);
        setIsFormModalOpen(true);
    };

    const handleView = (config: SystemConfig) => {
        setViewingConfig(config);
        setIsViewModalOpen(true);
    };

    const handleOpenEditModal = (config: SystemConfig) => {
        setSelectedConfig(config);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteDialog = (config: SystemConfig) => {
        setSelectedConfig(config);
        setIsDeleteDialogOpen(true);
    };

    const handleFormSubmit = async (data: SystemConfigFormData) => {
        setIsLoading(true);
        try {
            if (selectedConfig) {
                await systemConfigApi.update(selectedConfig.id, data);
                toast({ title: 'Cập nhật thành công', description: `Cấu hình "${data.name}" đã được cập nhật.` });
            } else {
                await systemConfigApi.create(data);
                toast({ title: 'Thêm mới thành công', description: `Cấu hình "${data.name}" đã được tạo.` });
            }
            await loadConfigs(searchParams);
            setIsFormModalOpen(false);
            setSelectedConfig(null);
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedConfig) return;
        setIsLoading(true);
        try {
            await systemConfigApi.delete(selectedConfig.id);
            toast({ title: 'Xóa thành công', description: `Cấu hình "${selectedConfig.name}" đã được xóa.`, variant: 'destructive' });
            await loadConfigs(searchParams);
            setIsDeleteDialogOpen(false);
            setSelectedConfig(null);
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message || 'Không thể xóa cấu hình', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading && configs.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Cấu hình hệ thống"
                description="Quản lý các cấu hình hệ thống"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Làm mới
                        </Button>
                        <Button onClick={handleOpenCreateModal}>
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm cấu hình
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
                                placeholder="Tìm kiếm theo tên, key, giá trị..."
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
                    ) : configs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{searchKeyword ? 'Không tìm thấy cấu hình nào' : 'Chưa có cấu hình nào'}</p>
                            {!searchKeyword && (
                                <Button className="mt-4" onClick={handleOpenCreateModal}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm cấu hình đầu tiên
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[140px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                                            <TableHead className="w-12">STT</TableHead>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Tên cấu hình</TableHead>
                                            <TableHead>Config Key</TableHead>
                                            <TableHead>Config Value</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {configs.map((config, index) => (
                                            <TableRow key={config.id}>
                                                <TableCell className="sticky left-0 bg-background z-10">
                                                    <div className="flex justify-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleView(config)} title="Xem">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={() => handleOpenEditModal(config)} title="Sửa">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => handleOpenDeleteDialog(config)} title="Xóa">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{pageNumber * searchParams.pageSize + index + 1}</TableCell>
                                                <TableCell className="font-mono text-sm">{config.code || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="w-4 h-4 text-primary" />
                                                        <span className="font-medium">{config.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-purple-600">{config.configKey || '-'}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={config.configValue}>{config.configValue || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{getConfigTypeName(config.configType)}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground max-w-[150px] truncate" title={config.note}>{config.note || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {configs.map((config) => (
                                    <div key={config.id} className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Settings className="w-5 h-5 text-primary" />
                                                <span className="font-semibold">{config.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(config)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(config)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDeleteDialog(config)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p><span className="text-muted-foreground">Key:</span> <span className="font-mono text-purple-600">{config.configKey}</span></p>
                                            <p><span className="text-muted-foreground">Value:</span> {config.configValue || '-'}</p>
                                            <Badge variant="secondary" className="mt-2">{getConfigTypeName(config.configType)}</Badge>
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

            <SystemConfigFormModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                config={viewingConfig}
                isLoading={false}
                onSubmit={() => { }}
                mode="view"
            />

            <SystemConfigFormModal
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                config={selectedConfig}
                isLoading={isLoading}
                onSubmit={handleFormSubmit}
                mode={selectedConfig ? 'edit' : 'create'}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Xác nhận xóa cấu hình"
                description={`Bạn có chắc chắn muốn xóa cấu hình "${selectedConfig?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="destructive"
                isLoading={isLoading}
                onConfirm={handleDelete}
            />
        </div>
    );
}
