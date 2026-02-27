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
import { Certificate, CertificateFormData } from '@/types/certificate';

const certificateFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, { message: 'Tên chứng chỉ phải có ít nhất 2 ký tự' }),
  description: z.string().optional(),
  personId: z.string().min(1, { message: 'Vui lòng chọn người sở hữu' }),
});

type CertificateFormValues = z.infer<typeof certificateFormSchema>;

interface CertificateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate | null;
  persons: Array<{ id: string; displayName: string }>;
  isLoading?: boolean;
  onSubmit: (data: CertificateFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function CertificateFormModal({
  open,
  onOpenChange,
  certificate,
  persons,
  isLoading = false,
  onSubmit,
  mode = certificate ? 'edit' : 'create',
}: CertificateFormModalProps) {
  const isEditing = !!certificate;
  const isViewMode = mode === 'view';

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      personId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (certificate) {
        form.reset({
          code: certificate.code || '',
          name: certificate.name,
          description: certificate.description || '',
          personId: certificate.person?.id || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          personId: '',
        });
      }
    }
  }, [certificate, form, open]);

  const handleSubmit = (data: CertificateFormValues) => {
    onSubmit({
      id: certificate?.id,
      code: data.code || '',
      name: data.name,
      description: data.description,
      personId: data.personId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết chứng chỉ' : isEditing ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Xem thông tin chi tiết chứng chỉ' : isEditing ? 'Cập nhật thông tin chứng chỉ' : 'Điền thông tin chứng chỉ mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã chứng chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="CERT-001 (để trống sẽ tự sinh)" disabled={isViewMode} {...field} />
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
                  <FormLabel>Tên chứng chỉ *</FormLabel>
                  <FormControl>
                    <Input placeholder="Chứng chỉ IELTS" disabled={isViewMode} {...field} />
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
                    <Textarea placeholder="Mô tả chứng chỉ..." className="resize-none" rows={3} disabled={isViewMode} {...field} />
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
                  <FormLabel>Người sở hữu *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người sở hữu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.displayName}
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