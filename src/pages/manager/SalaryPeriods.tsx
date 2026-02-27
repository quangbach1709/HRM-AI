import { useState } from 'react';
import { Plus, Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalaryPeriodFormModal } from '@/components/modals/SalaryPeriodFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface SalaryPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  payDate: Date;
  employees: number;
  totalAmount: string;
}

const initialPeriods: SalaryPeriod[] = [
  {
    id: 1,
    name: 'Tháng 12/2024',
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 31),
    status: 'processing',
    payDate: new Date(2024, 11, 25),
    employees: 156,
    totalAmount: '4.900.000.000 ₫',
  },
  {
    id: 2,
    name: 'Tháng 01/2025',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 31),
    status: 'pending',
    payDate: new Date(2025, 0, 25),
    employees: 158,
    totalAmount: '4.970.000.000 ₫',
  },
  {
    id: 3,
    name: 'Tháng 11/2024',
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2024, 10, 30),
    status: 'completed',
    payDate: new Date(2024, 10, 25),
    employees: 154,
    totalAmount: '4.856.000.000 ₫',
  },
];

const statusConfig = {
  completed: { icon: CheckCircle, color: 'success' as const, label: 'Hoàn thành' },
  processing: { icon: Clock, color: 'warning' as const, label: 'Đang xử lý' },
  pending: { icon: AlertCircle, color: 'default' as const, label: 'Chờ xử lý' },
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function SalaryPeriods() {
  const { toast } = useToast();
  const [periods, setPeriods] = useState(initialPeriods);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SalaryPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = usePagination(periods, { initialPageSize: 10 });

  const handleAddNew = () => {
    setSelectedPeriod(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (period: SalaryPeriod) => {
    setSelectedPeriod(period);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (period: SalaryPeriod) => {
    setSelectedPeriod(period);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({ 
      title: selectedPeriod ? 'Cập nhật thành công' : 'Thêm thành công', 
      description: `Đã ${selectedPeriod ? 'cập nhật' : 'tạo'} kỳ lương` 
    });
    setIsFormModalOpen(false);
    setSelectedPeriod(null);
  };

  const handleDelete = async () => {
    if (!selectedPeriod) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPeriods((prev) => prev.filter((p) => p.id !== selectedPeriod.id));
      toast({ title: 'Xóa thành công', description: `Đã xóa kỳ lương "${selectedPeriod.name}"` });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra, vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusAction = async (period: SalaryPeriod, action: 'start' | 'complete') => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newStatus = action === 'start' ? 'processing' : 'completed';
      setPeriods((prev) =>
        prev.map((p) => (p.id === period.id ? { ...p, status: newStatus } : p))
      );
      
      toast({
        title: action === 'start' ? 'Đã bắt đầu xử lý' : 'Đã hoàn thành',
        description: `Kỳ lương "${period.name}" ${action === 'start' ? 'đang được xử lý' : 'đã hoàn thành'}`,
      });
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra', variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader
        title="Kỳ lương"
        description="Định nghĩa và quản lý các kỳ tính lương"
        action={
          <Button className="touch-target" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo kỳ lương
          </Button>
        }
      />

      <div className="space-y-4">
        {pagination.paginatedData.map((period) => {
          const statusInfo = statusConfig[period.status as keyof typeof statusConfig];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={period.id} className="card-interactive">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-manager/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-manager" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{period.name}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            statusInfo.color === 'success'
                              ? 'status-success'
                              : statusInfo.color === 'warning'
                              ? 'status-warning'
                              : ''
                          }
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(period.startDate)} — {formatDate(period.endDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ngày trả lương: {formatDate(period.payDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{period.employees}</p>
                        <p className="text-xs text-muted-foreground">Nhân viên</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-manager">{period.totalAmount}</p>
                        <p className="text-xs text-muted-foreground">Tổng cộng</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(period)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      {period.status === 'pending' && (
                        <Button size="sm" onClick={() => handleStatusAction(period, 'start')}>
                          Bắt đầu xử lý
                        </Button>
                      )}
                      {period.status === 'processing' && (
                        <Button size="sm" onClick={() => handleStatusAction(period, 'complete')}>
                          Hoàn thành
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteClick(period)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <PaginationControls {...pagination} />
      </Card>

      <SalaryPeriodFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        editData={null}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa kỳ lương"
        description={`Bạn có chắc chắn muốn xóa kỳ lương "${selectedPeriod?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}