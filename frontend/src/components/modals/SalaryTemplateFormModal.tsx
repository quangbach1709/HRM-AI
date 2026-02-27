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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SalaryTemplate, SalaryTemplateFormData } from '@/types/salaryTemplate';

const formSchema = z.object({
  code: z.string().min(1, { message: 'Mã mẫu lương là bắt buộc' }),
  name: z.string().min(1, { message: 'Tên mẫu lương là bắt buộc' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SalaryTemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SalaryTemplate | null;
  isLoading?: boolean;
  onSubmit: (data: SalaryTemplateFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function SalaryTemplateFormModal({
  open,
  onOpenChange,
  data,
  isLoading = false,
  onSubmit,
  mode = 'create',
}: SalaryTemplateFormModalProps) {
  const isEditing = !!data && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (data) {
        form.reset({
          code: data.code,
          name: data.name,
          description: data.description || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
        });
      }
    }
  }, [data, form, open]);

  const handleSubmit = (values: FormValues) => {
    if (isViewMode) return;
    onSubmit({
      id: data?.id,
      code: values.code,
      name: values.name,
      description: values.description || undefined,
    });
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết mẫu lương';
    return isEditing ? 'Chỉnh sửa mẫu lương' : 'Thêm mẫu lương mới';
  };

  const getDialogDescription = () => {
    if (isViewMode) return 'Thông tin chi tiết mẫu lương';
    return isEditing ? 'Cập nhật thông tin mẫu lương' : 'Điền thông tin để tạo mẫu lương mới';
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã mẫu lương *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SAL001" {...field} disabled={isEditing || isViewMode} />
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
                  <FormLabel>Tên mẫu lương *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Mẫu lương tháng cơ bản" {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
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
