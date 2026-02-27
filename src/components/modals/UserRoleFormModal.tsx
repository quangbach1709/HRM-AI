import React, { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchUserRoleDto } from '@/types/role';
import { roleApi } from '@/services/roleApi';
import { userApi } from '@/services/userApi';
import { Role } from '@/types/role';
import { User } from '@/types/user';

const schema = z.object({
  userId: z.string().min(1, 'User is required'),
  roleId: z.string().min(1, 'Role is required'),
});

interface UserRoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SearchUserRoleDto) => Promise<void>;
  mode?: 'view' | 'edit' | 'create';
  data?: { userId: string; roleId: string } | null;
}

export function UserRoleFormModal({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  data,
}: UserRoleFormModalProps) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const isViewMode = mode === 'view';

  // Load roles and users
  useEffect(() => {
    if (open) {
      roleApi.getAll().then(setRoles).catch(console.error);
      userApi.getAll().then(setUsers).catch(console.error);
    }
  }, [open]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: '',
      roleId: '',
    },
  });

  useEffect(() => {
    if (open && data) {
      form.reset({
        userId: data.userId || '',
        roleId: data.roleId || '',
      });
    } else if (open) {
      form.reset({
        userId: '',
        roleId: '',
      });
    }
  }, [open, data, form]);

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    if (isViewMode) return;
    
    setIsLoading(true);
    try {
      const dto: SearchUserRoleDto = {
        userId: values.userId,
        roleId: values.roleId,
        pageIndex: 0,
        pageSize: 0
      };
      await onSubmit(dto);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết phân quyền';
    return 'Assign Role to User';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username}
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
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isViewMode ? 'Đóng' : 'Cancel'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Assigning...' : 'Assign'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
