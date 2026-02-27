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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Department, DepartmentFormData } from '@/types/department';

const departmentFormSchema = z.object({
  code: z.string().nullable().optional().or(z.literal('')),
  name: z.string().min(2, { message: 'Tên phòng ban phải có ít nhất 2 ký tự' }),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  allDepartments?: Department[];
  isLoading?: boolean;
  onSubmit: (data: DepartmentFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function DepartmentFormModal({
  open,
  onOpenChange,
  department,
  allDepartments = [],
  isLoading = false,
  onSubmit,
  mode = department ? 'edit' : 'create',
}: DepartmentFormModalProps) {
  const isEditing = !!department;
  const isViewMode = mode === 'view';

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      parentId: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (department) {
        form.reset({
          code: department.code || '',
          name: department.name,
          description: department.description || '',
          parentId: department.parentId || null,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          parentId: null,
        });
      }
    }
  }, [department, form, open]);

  const handleSubmit = (data: DepartmentFormValues) => {
    onSubmit({
      id: department?.id,
      code: data.code || undefined,
      name: data.name,
      description: data.description || undefined,
      parentId: data.parentId || null,
    });
  };

  // Filter out current department and its descendants from parent selection
  const getDescendantIds = (dept: Department): string[] => {
    const ids = [dept.id];
    if (dept.subRows) {
      dept.subRows.forEach(child => {
        ids.push(...getDescendantIds(child));
      });
    }
    return ids;
  };

  const excludeIds = department ? getDescendantIds(department) : [];
  const availableParents = allDepartments.filter(d => !excludeIds.includes(d.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết phòng ban' : isEditing ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? 'Xem thông tin chi tiết phòng ban'
              : isEditing
              ? 'Cập nhật thông tin phòng ban'
              : 'Điền thông tin để tạo phòng ban mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã phòng ban (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: DEPT-IT (để trống sẽ tự sinh)"
                      disabled={isViewMode}
                      {...field}
                    />
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
                  <FormLabel>Tên phòng ban *</FormLabel>
                  <FormControl>
                    <Input placeholder="Phòng Kỹ thuật" disabled={isViewMode} {...field} />
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
                      placeholder="Mô tả về phòng ban..."
                      className="resize-none"
                      rows={3}
                      disabled={isViewMode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban cha</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban cha (nếu có)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Không có (Phòng ban gốc)</SelectItem>
                      {availableParents.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} {dept.code && `(${dept.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
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
