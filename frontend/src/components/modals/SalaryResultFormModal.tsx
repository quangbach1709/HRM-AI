import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalaryResult, SalaryResultFormData } from '@/types/salaryResult';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên bảng lương' }),
  salaryPeriodId: z.string().min(1, { message: 'Vui lòng chọn kỳ lương' }),
  salaryTemplateId: z.string().min(1, { message: 'Vui lòng chọn mẫu lương' }),
});

type FormValues = z.infer<typeof formSchema>;

interface SalaryResultFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SalaryResult | null;
  salaryPeriods: Array<{ id: string; name: string }>;
  salaryTemplates: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  onSubmit: (data: SalaryResultFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function SalaryResultFormModal({
  open,
  onOpenChange,
  data,
  salaryPeriods,
  salaryTemplates,
  isLoading = false,
  onSubmit,
  mode = 'create',
}: SalaryResultFormModalProps) {
  const isEditing = !!data && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      salaryPeriodId: '',
      salaryTemplateId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (data) {
        form.reset({
          name: data.name,
          salaryPeriodId: data.salaryPeriodId || data.salaryPeriod?.id || '',
          salaryTemplateId: data.salaryTemplateId || data.salaryTemplate?.id || '',
        });
      } else {
        form.reset({
          name: '',
          salaryPeriodId: '',
          salaryTemplateId: '',
        });
      }
    }
  }, [data, form, open]);

  const handleSubmit = (values: FormValues) => {
    if (isViewMode) return;
    onSubmit({
      ...values,
      id: data?.id,
    } as SalaryResultFormData);
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết bảng lương';
    return isEditing ? 'Chỉnh sửa bảng lương' : 'Thêm bảng lương mới';
  };

  const getDialogDescription = () => {
    if (isViewMode) return 'Thông tin chi tiết bảng lương';
    return isEditing ? 'Cập nhật thông tin bảng lương' : 'Điền thông tin bảng lương mới';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên bảng lương *</FormLabel>
                  <FormControl>
                    <Input placeholder="Lương tháng 05/2025" {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryPeriodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kỳ lương *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kỳ lương" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salaryPeriods.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
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
              name="salaryTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mẫu lương *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mẫu lương" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salaryTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
