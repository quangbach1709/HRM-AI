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
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FaceEmbedding } from '@/types/face-embedding';
import { getFileUrl } from '@/services/fileApi';

const faceFormSchema = z.object({
  personId: z.string().min(1, { message: 'Vui lòng chọn nhân viên' }),
  isActive: z.boolean(),
  modelVersion: z.string().optional(),
});

type FaceFormValues = z.infer<typeof faceFormSchema>;

export interface FaceEmbeddingFormData {
  id?: string;
  personId: string;
  isActive: boolean;
  modelVersion?: string;
}

interface FaceEmbeddingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  face?: FaceEmbedding | null;
  persons: Array<{ id: string; displayName: string }>;
  isLoading?: boolean;
  onSubmit: (data: FaceEmbeddingFormData) => void;
  mode?: 'view' | 'edit';
}

export function FaceEmbeddingFormModal({
  open,
  onOpenChange,
  face,
  persons,
  isLoading = false,
  onSubmit,
  mode = 'edit',
}: FaceEmbeddingFormModalProps) {
  const isViewMode = mode === 'view';

  const form = useForm<FaceFormValues>({
    resolver: zodResolver(faceFormSchema),
    defaultValues: {
      personId: '',
      isActive: false,
      modelVersion: '',
    },
  });

  useEffect(() => {
    if (open && face) {
      form.reset({
        personId: face.person?.id || '',
        isActive: face.active,
        modelVersion: face.modelVersion || '',
      });
    }
  }, [face, form, open]);

  const handleSubmit = (data: FaceFormValues) => {
    if (isViewMode) return;
    onSubmit({
      id: face?.id,
      personId: data.personId,
      isActive: data.isActive,
      modelVersion: data.modelVersion,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = () => {
    if (!face?.imageUrl) return '/placeholder-face.jpg';
    return getFileUrl(face.imageUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết khuôn mặt' : 'Chỉnh sửa thông tin khuôn mặt'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Xem thông tin chi tiết khuôn mặt đã đăng ký' : 'Cập nhật thông tin khuôn mặt'}
          </DialogDescription>
        </DialogHeader>

        {face && (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="flex justify-center">
              <img
                src={getImageUrl()}
                alt="Face"
                className="w-32 h-32 rounded-lg object-cover bg-muted border"
              />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Person Select */}
                <FormField
                  control={form.control}
                  name="personId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhân viên *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên" />
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

                {/* Model Version */}
                <FormField
                  control={form.control}
                  name="modelVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phiên bản Model</FormLabel>
                      <FormControl>
                        <Input placeholder="ArcFace_v1" disabled={isViewMode} {...field} />
                      </FormControl>
                      <FormDescription>Phiên bản model AI đã sử dụng để tạo embedding</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Active Switch */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái duyệt</FormLabel>
                        <FormDescription>
                          {field.value ? 'Đã được duyệt và hoạt động' : 'Chưa được duyệt'}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isViewMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Read-only Info */}
                <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="font-mono text-xs">{face.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày tạo:</span>
                    <span>{formatDate(face.createdAt)}</span>
                  </div>
                  {face.updatedAt && (
                    <div className="flex justify-between">
                      <span>Ngày cập nhật:</span>
                      <span>{formatDate(face.updatedAt)}</span>
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
