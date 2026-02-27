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
import { RecruitmentRequest, RecruitmentRequestFormData } from '@/types/recruitment';

const requestFormSchema = z.object({
  code: z.string().min(1, { message: 'Vui lòng nhập mã yêu cầu' }),
  name: z.string().min(2, { message: 'Tên yêu cầu phải có ít nhất 2 ký tự' }),
  proposerId: z.string().min(1, { message: 'Vui lòng chọn người đề xuất' }),
  proposalDate: z.string().min(1, { message: 'Vui lòng chọn ngày đề xuất' }),
  request: z.string().min(10, { message: 'Yêu cầu công việc phải có ít nhất 10 ký tự' }),
  positionId: z.string().min(1, { message: 'Vui lòng chọn vị trí cần tuyển' }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface RecruitmentRequestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: RecruitmentRequest | null;
  positions: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; displayName: string }>;
  isLoading?: boolean;
  onSubmit: (data: RecruitmentRequestFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function RecruitmentRequestFormModal({
  open,
  onOpenChange,
  request,
  positions,
  staff,
  isLoading = false,
  onSubmit,
  mode = 'create',
}: RecruitmentRequestFormModalProps) {
  const isEditing = !!request && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      code: '',
      name: '',
      proposerId: '',
      proposalDate: new Date().toISOString().split('T')[0],
      request: '',
      positionId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (request) {
        form.reset({
          code: request.code,
          name: request.name,
          proposerId: request.proposer?.id || '',
          proposalDate: request.proposalDate ? new Date(request.proposalDate).toISOString().split('T')[0] : '',
          request: request.request,
          positionId: request.position?.id || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          proposerId: '',
          proposalDate: new Date().toISOString().split('T')[0],
          request: '',
          positionId: '',
        });
      }
    }
  }, [request, form, open]);

  const handleSubmit = (data: RequestFormValues) => {
    if (isViewMode) return;
    onSubmit({
      id: request?.id,
      code: data.code,
      name: data.name,
      proposerId: data.proposerId,
      proposalDate: data.proposalDate,
      request: data.request,
      positionId: data.positionId,
    });
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết yêu cầu tuyển dụng';
    return isEditing ? 'Chỉnh sửa yêu cầu tuyển dụng' : 'Thêm yêu cầu tuyển dụng mới';
  };

  const getDialogDescription = () => {
    if (isViewMode) return 'Thông tin chi tiết yêu cầu tuyển dụng';
    return isEditing ? 'Cập nhật thông tin yêu cầu' : 'Điền thông tin yêu cầu tuyển dụng';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã yêu cầu *</FormLabel>
                    <FormControl>
                      <Input placeholder="REQ-001" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày đề xuất *</FormLabel>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên yêu cầu *</FormLabel>
                  <FormControl>
                    <Input placeholder="Tuyển lập trình viên Frontend" {...field} disabled={isViewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="proposerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người đề xuất *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người đề xuất" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.displayName}
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
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí cần tuyển *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((p) => (
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
            </div>

            <FormField
              control={form.control}
              name="request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu công việc *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết yêu cầu tuyển dụng..."
                      className="resize-none"
                      rows={4}
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
