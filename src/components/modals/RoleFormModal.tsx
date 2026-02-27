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
import { Role, RoleFormData } from '@/types/role';

const roleFormSchema = z.object({
  name: z.string().min(2, { message: 'Tên vai trò phải có ít nhất 2 ký tự' }),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  isLoading?: boolean;
  onSubmit: (data: RoleFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function RoleFormModal({
  open,
  onOpenChange,
  role,
  isLoading = false,
  onSubmit,
  mode = 'create',
}: RoleFormModalProps) {
  const isEditing = !!role && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (role) {
        form.reset({
          name: role.name,
          description: role.description || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
        });
      }
    }
  }, [role, form, open]);

  const handleSubmit = (data: RoleFormValues) => {
    if (isViewMode) return;
    onSubmit({
      id: role?.id,
      name: data.name,
      description: data.description || undefined,
    });
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết vai trò';
    return isEditing ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới';
  };

  const getDialogDescription = () => {
    if (isViewMode) return 'Thông tin chi tiết vai trò';
    return isEditing ? 'Cập nhật thông tin vai trò' : 'Điền thông tin để tạo vai trò mới';
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
                  <FormLabel>Tên vai trò *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Quản trị viên" {...field} disabled={isViewMode} />
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
                      placeholder="Mô tả chức năng, phạm vi quyền hạn..."
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
