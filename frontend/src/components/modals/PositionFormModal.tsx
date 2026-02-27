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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Position, PositionFormData } from '@/types/position';
import { Department } from '@/types/department';
import { Staff } from '@/types/staff';
import { staffApi } from '@/services/staffApi';
import { useState } from 'react';

const positionFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, { message: 'Tên vị trí phải có ít nhất 2 ký tự' }),
  description: z.string().optional(),
  departmentId: z.string().optional(), // Có thể null hoặc có giá trị
  staffId: z.string().optional(),
  isMain: z.boolean().default(false),
});

type PositionFormValues = z.infer<typeof positionFormSchema>;

interface PositionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
  allDepartments?: Department[];
  isLoading?: boolean;
  onSubmit: (data: PositionFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function PositionFormModal({
  open,
  onOpenChange,
  position,
  allDepartments = [],
  isLoading = false,
  onSubmit,
  mode = position ? 'edit' : 'create',
}: PositionFormModalProps) {
  const isEditing = !!position;
  const isViewMode = mode === 'view';

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      departmentId: '',
      isMain: false,
    },
  });

  const [allStaff, setAllStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (open) {
      staffApi.getAll().then(setAllStaff).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (position) {
        form.reset({
          code: position.code || '',
          name: position.name,
          description: position.description || '',
          departmentId: position.department?.id || '',
          staffId: position.staff?.id || '',
          isMain: position.isMain || false,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          departmentId: '',
          staffId: '',
          isMain: false,
        });
      }
    }
  }, [position, form, open]);

  const handleSubmit = (data: PositionFormValues) => {
    const formData: PositionFormData = {
      id: position?.id,
      code: data.code || undefined,
      name: data.name,
      description: data.description || undefined,
      departmentId: data.departmentId || undefined,
      staffId: data.staffId || undefined,
      isMain: data.isMain,
    };
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết vị trí' : isEditing ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? 'Xem thông tin chi tiết vị trí công việc'
              : isEditing
                ? 'Cập nhật thông tin vị trí công việc'
                : 'Điền thông tin để tạo vị trí công việc mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã vị trí</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: POS-DEV (để trống sẽ tự sinh)"
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
                  <FormLabel>Tên vị trí *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhân viên lập trình" disabled={isViewMode} {...field} />
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
                      placeholder="Mô tả về vị trí..."
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
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban (nếu có)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {allDepartments.map((dept) => (
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

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhân viên đảm nhận</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    disabled={isViewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân viên (nếu có)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Chưa có</SelectItem>
                      {allStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.staffCode} - {staff.displayName}
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
              name="isMain"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Là vị trí chính?
                    </FormLabel>
                    <FormDescription>
                      Đánh dấu nếu đây là vị trí chính thức/quan trọng
                    </FormDescription>
                  </div>
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
