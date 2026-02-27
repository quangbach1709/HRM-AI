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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SalaryTemplateItem, SalaryItemType } from '../../types/salaryTemplateItem';
import { salaryTemplateItemApi } from '../../services/salaryTemplateItemApi';
import { salaryTemplateApi } from '../../services/salaryTemplateApi';
import { SalaryTemplate } from '../../types/salaryTemplate';

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  displayOrder: z.coerce.number().min(1, 'Thứ tự hiển thị phải > 0').default(1),
  salaryTemplateId: z.string().min(1, 'Mẫu lương là bắt buộc'),
  salaryItemType: z.coerce.number().default(SalaryItemType.FIXED),
  defaultAmount: z.coerce.number().optional(),
  formula: z.string().optional(),
});

export type SalaryTemplateItemFormValues = z.infer<typeof formSchema>;

type FormValues = z.infer<typeof formSchema>;

interface SalaryTemplateItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: SalaryTemplateItem | null;
  mode?: 'view' | 'edit' | 'create';
}

export function SalaryTemplateItemFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  mode = 'create',
}: SalaryTemplateItemFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [salaryTemplates, setSalaryTemplates] = useState<SalaryTemplate[]>([]);
  const { toast } = useToast();
  const isEditMode = !!editData && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      displayOrder: 1,
      salaryTemplateId: '',
      salaryItemType: SalaryItemType.FIXED,
      defaultAmount: 0,
      formula: '',
    },
  });

  // Fetch Salary Templates for dropdown
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await salaryTemplateApi.getAll();
        setSalaryTemplates(templates);
      } catch (error) {
        console.error("Failed to load salary templates", error);
      }
    };
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        form.reset({
          code: editData.code,
          name: editData.name,
          displayOrder: editData.displayOrder,
          salaryTemplateId: editData.salaryTemplate?.id || '',
          salaryItemType: editData.salaryItemType,
          defaultAmount: editData.defaultAmount || 0,
          formula: editData.formula || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          displayOrder: 1,
          salaryTemplateId: '',
          salaryItemType: SalaryItemType.FIXED,
          defaultAmount: 0,
          formula: '',
        });
      }
    }
  }, [isOpen, editData, form]);

  const handleSubmit = async (values: FormValues) => {
    if (isViewMode) return;
    
    setLoading(true);
    try {
      const formData = {
        ...values,
        displayOrder: values.displayOrder,
        salaryTemplateId: values.salaryTemplateId,
        salaryItemType: values.salaryItemType,
      };
      if (isEditMode && editData) {
        await salaryTemplateItemApi.update(editData.id, formData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật mục lương thành công',
          variant: 'default',
        });
      } else {
        await salaryTemplateItemApi.create(formData);
        toast({
          title: 'Thành công',
          description: 'Tạo mới mục lương thành công',
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

  // Watch salaryItemType to conditionally show fields
  const salaryItemType = form.watch('salaryItemType');

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết mục lương';
    return isEditMode ? 'Cập nhật mục lương' : 'Thêm mới mục lương';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="salaryTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mẫu lương <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isViewMode}
                  >
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã mục lương</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SAL_BASIC" {...field} disabled={isViewMode} />
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
                    <FormLabel>Tên mục lương</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Lương cơ bản" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryItemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại mục lương <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={String(SalaryItemType.FIXED)}>Cố định</SelectItem>
                        <SelectItem value={String(SalaryItemType.USING_FORMULA)}>Công thức</SelectItem>
                        <SelectItem value={String(SalaryItemType.USER_INPUT)}>Hệ thống lấy dự liệu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {salaryItemType === SalaryItemType.FIXED && (
              <FormField
                control={form.control}
                name="defaultAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền mặc định</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {salaryItemType === SalaryItemType.USING_FORMULA && (
              <FormField
                control={form.control}
                name="formula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Công thức</FormLabel>
                    <FormControl>
                      <Textarea placeholder="VD: [Lương cơ bản] * [Hệ số]" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
