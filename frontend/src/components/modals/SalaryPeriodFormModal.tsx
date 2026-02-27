import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SalaryPeriod, SalaryPeriodStatus, SalaryPeriodStatusLabel } from '../../types/salaryPeriod';
import { salaryPeriodApi } from '../../services/salaryPeriodApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  code: z.string().min(1, 'Mã kỳ lương là bắt buộc'),
  name: z.string().min(1, 'Tên kỳ lương là bắt buộc'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  estimatedWorkingDays: z.coerce.number().min(0, 'Số ngày công phải >= 0').optional(),
  salaryPeriodStatus: z.number().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

interface SalaryPeriodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: SalaryPeriod | null;
  mode?: 'view' | 'edit' | 'create';
}

export function SalaryPeriodFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  mode = 'create',
}: SalaryPeriodFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!editData && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      estimatedWorkingDays: 22,
      salaryPeriodStatus: SalaryPeriodStatus.DRAFT,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        form.reset({
          code: editData.code,
          name: editData.name,
          description: editData.description || '',
          startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
          endDate: editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '',
          estimatedWorkingDays: editData.estimatedWorkingDays || 0,
          salaryPeriodStatus: editData.salaryPeriodStatus,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          estimatedWorkingDays: 0,
          salaryPeriodStatus: SalaryPeriodStatus.DRAFT,
        });
      }
    }
  }, [isOpen, editData, form]);

  // Watch startDate and endDate
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  useEffect(() => {
    // Only auto-calculate in create mode or if explicitly enabled
    // Here we simply auto-calculate whenever dates change and are valid
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start <= end) {
        let count = 0;
        const curDate = new Date(start);
        while (curDate <= end) {
          const dayOfWeek = curDate.getDay();
          // Exclude Saturday (6) and Sunday (0) -> Standard 22 days/month usually implies 5 days/week
          // If the user wants 26 days (excluding only Sunday), we would only check dayOfWeek !== 0
          // Given default is 22, we assume Mon-Fri work week.
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
          }
          curDate.setDate(curDate.getDate() + 1);
        }
        form.setValue('estimatedWorkingDays', count);
      }
    }
  }, [startDate, endDate, form]);

  const handleSubmit = async (values: FormValues) => {
    if (isViewMode) return;

    setLoading(true);
    try {
      const payload = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
      };

      if (isEditMode && editData) {
        await salaryPeriodApi.update(editData.id, payload);
        toast({
          title: 'Thành công',
          description: 'Cập nhật kỳ lương thành công',
          variant: 'default',
        });
      } else {
        await salaryPeriodApi.create(payload);
        toast({
          title: 'Thành công',
          description: 'Tạo mới kỳ lương thành công',
          variant: 'default',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết kỳ lương';
    return isEditMode ? 'Cập nhật kỳ lương' : 'Thêm mới kỳ lương';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã kỳ lương <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 01-2025" {...field} disabled={isEditMode || isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên kỳ lương <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Kỳ lương tháng 1/2025" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salaryPeriodStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SalaryPeriodStatusLabel).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedWorkingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số công chuẩn</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả thêm..." {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={loading}>
                  {loading && <span className="mr-2 animate-spin">⏳</span>}
                  {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
