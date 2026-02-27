import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const timekeepingSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.string().min(1, 'Vui lòng chọn trạng thái'),
  note: z.string().optional(),
});

export type TimekeepingFormData = z.infer<typeof timekeepingSchema>;

interface TimekeepingRecord {
  id: number;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface TimekeepingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: TimekeepingRecord | null;
  onSubmit: (data: TimekeepingFormData) => void;
  isLoading?: boolean;
  mode?: 'view' | 'edit' | 'create';
}

const statuses = [
  { id: 'present', label: 'Có mặt' },
  { id: 'late', label: 'Đi muộn' },
  { id: 'absent', label: 'Vắng mặt' },
  { id: 'leave', label: 'Nghỉ phép' },
];

export function TimekeepingFormModal({
  open,
  onOpenChange,
  record,
  onSubmit,
  isLoading = false,
  mode = 'edit',
}: TimekeepingFormModalProps) {
  const isViewMode = mode === 'view';

  const form = useForm<TimekeepingFormData>({
    resolver: zodResolver(timekeepingSchema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      status: 'present',
      note: '',
    },
  });

  useEffect(() => {
    if (open && record) {
      form.reset({
        checkIn: record.checkIn !== '-' ? record.checkIn : '',
        checkOut: record.checkOut !== '-' ? record.checkOut : '',
        status: record.status,
        note: '',
      });
    }
  }, [open, record, form]);

  const handleSubmit = (data: TimekeepingFormData) => {
    if (isViewMode) return;
    onSubmit(data);
  };

  const getDialogTitle = () => {
    if (isViewMode) return `Chi tiết chấm công - ${record?.name}`;
    return `Chỉnh sửa chấm công - ${record?.name}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Ngày: <span className="font-medium text-foreground">{record?.date}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ vào</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ ra</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Input placeholder="Lý do điều chỉnh..." {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
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
                  Cập nhật
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
