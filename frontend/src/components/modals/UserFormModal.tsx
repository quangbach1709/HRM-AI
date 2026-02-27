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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserFormData } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { roleApi } from '@/services/roleApi';
import { personApi } from '@/services/personApi';
import { Role } from '@/types/role';
import { Person } from '@/types/person';

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
  personId: z.string().optional(),
});

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'view' | 'edit' | 'create';
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
  mode = 'create',
}: UserFormModalProps) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [persons, setPersons] = React.useState<Person[]>([]);
  const { toast } = useToast();

  const isViewMode = mode === 'view';
  const isEditing = !!user && mode !== 'view';

  // Load roles and persons
  useEffect(() => {
    if (open) {
      roleApi.getAll().then(setRoles).catch(console.error);
      personApi.getAll().then(setPersons).catch(console.error);
    }
  }, [open]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      personId: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        roleIds: user.roles?.map(r => r.id) || [],
        personId: user.person?.id || '',
      });
    } else {
      form.reset({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleIds: [],
        personId: '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: z.infer<typeof userSchema>) => {
    if (isViewMode) return;
    
    if (values.password && values.password !== values.confirmPassword) {
      form.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    const formData: UserFormData = {
      username: values.username,
      email: values.email,
      password: values.password || undefined,
      confirmPassword: values.confirmPassword || undefined,
      roles: values.roleIds?.map(id => ({ id })),
      person: values.personId ? { id: values.personId } : undefined,
    };

    await onSubmit(formData);
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết User';
    return user ? 'Update User' : 'Create User';
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!user || isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Person</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.displayName} ({person.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user && !isViewMode && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {user && !isViewMode && (
              <>
                <div className="text-sm text-muted-foreground">
                  Leave password blank to keep unchanged.
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="flex flex-wrap gap-2 border p-2 rounded-md">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value?.includes(role.id)}
                          onChange={(e) => {
                            if (isViewMode) return;
                            const checked = e.target.checked;
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, role.id]);
                            } else {
                              field.onChange(current.filter(id => id !== role.id));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                          disabled={isViewMode}
                        />
                        <span>{role.name}</span>
                      </label>
                    ))}
                  </div>
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
                  {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
