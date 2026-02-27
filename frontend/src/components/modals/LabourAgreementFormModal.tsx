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
import { LabourAgreement, LabourAgreementFormData, contractTypeOptions, agreementStatusOptions } from '@/types/labour-agreement';

const agreementFormSchema = z.object({
  staffId: z.string().min(1, { message: 'Vui lòng chọn nhân viên' }),
  contractType: z.number(),
  laborAgreementNumber: z.number().min(1, { message: 'Số hợp đồng phải lớn hơn 0' }),
  startDate: z.string().min(1, { message: 'Vui lòng chọn ngày bắt đầu' }),
  endDate: z.string().optional(),
  durationMonths: z.number().optional(),
  workingHour: z.number().min(1).max(24),
  workingHourWeekMin: z.number().optional(),
  salary: z.number().min(0, { message: 'Lương phải lớn hơn 0' }),
  signedDate: z.string().min(1, { message: 'Vui lòng chọn ngày ký' }),
  agreementStatus: z.number(),
});

type AgreementFormValues = z.infer<typeof agreementFormSchema>;

interface LabourAgreementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement?: LabourAgreement | null;
  staff: Array<{ id: string; staffCode: string; displayName: string }>;
  isLoading?: boolean;
  onSubmit: (data: LabourAgreementFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function LabourAgreementFormModal({
  open,
  onOpenChange,
  agreement,
  staff,
  isLoading = false,
  onSubmit,
  mode = 'create',
}: LabourAgreementFormModalProps) {
  const isEditing = !!agreement && mode !== 'view';
  const isViewMode = mode === 'view';

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      staffId: '',
      contractType: 0,
      laborAgreementNumber: 1,
      startDate: '',
      workingHour: 8,
      salary: 0,
      signedDate: new Date().toISOString().split('T')[0],
      agreementStatus: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (agreement) {
        form.reset({
          staffId: agreement.staffId,
          contractType: agreement.contractType,
          laborAgreementNumber: agreement.laborAgreementNumber,
          startDate: agreement.startDate,
          endDate: agreement.endDate || '',
          durationMonths: agreement.durationMonths,
          workingHour: agreement.workingHour,
          workingHourWeekMin: agreement.workingHourWeekMin,
          salary: agreement.salary,
          signedDate: agreement.signedDate,
          agreementStatus: agreement.agreementStatus,
        });
      } else {
        form.reset({
          staffId: '',
          contractType: 0,
          laborAgreementNumber: 1,
          startDate: '',
          workingHour: 8,
          salary: 0,
          signedDate: new Date().toISOString().split('T')[0],
          agreementStatus: 0,
        });
      }
    }
  }, [agreement, form, open]);

  const handleSubmit = (data: AgreementFormValues) => {
    if (isViewMode) return;
    onSubmit({
      id: agreement?.id,
      staffId: data.staffId,
      contractType: data.contractType,
      laborAgreementNumber: data.laborAgreementNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      durationMonths: data.durationMonths,
      workingHour: data.workingHour,
      workingHourWeekMin: data.workingHourWeekMin,
      salary: data.salary,
      signedDate: data.signedDate,
      agreementStatus: data.agreementStatus,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getDialogTitle = () => {
    if (isViewMode) return 'Chi tiết hợp đồng lao động';
    return isEditing ? 'Chỉnh sửa hợp đồng lao động' : 'Thêm hợp đồng lao động mới';
  };

  const getDialogDescription = () => {
    if (isViewMode) return 'Thông tin chi tiết hợp đồng';
    return isEditing ? 'Cập nhật thông tin hợp đồng' : 'Điền thông tin hợp đồng lao động';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staffId"
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
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.staffCode} - {s.displayName}
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
                name="laborAgreementNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hợp đồng *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hợp đồng *</FormLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại hợp đồng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
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
                name="agreementStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agreementStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="signedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày ký *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tháng</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="12"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ công/ngày *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHourWeekMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ tối thiểu/tuần</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lương ký hợp đồng (VNĐ) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10000000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  {field.value > 0 && (
                    <p className="text-sm text-muted-foreground">
                      = {formatCurrency(field.value)} VNĐ
                    </p>
                  )}
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
