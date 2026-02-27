import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Staff, StaffFormData, EmployeeStatus, StaffPhase } from '@/types/staff';
import { staffApi } from '@/services/staffApi';
import { genderOptions } from '@/types/person';
import { salaryTemplateApi } from '@/services/salaryTemplateApi';
import { SalaryTemplate } from '@/types/salaryTemplate';

const staffFormSchema = z.object({
  // Person Fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
  gender: z.number().optional(),
  idNumber: z.string().optional(),

  // Staff Fields
  staffCode: z.string().min(1, 'Mã nhân viên là bắt buộc').default(''),
  employeeStatus: z.number().default(EmployeeStatus.WORKING),
  staffPhase: z.number().default(StaffPhase.PROBATION),
  salaryTemplateId: z.string().optional(),
  requireAttendance: z.boolean().optional(),
  allowExternalIpTimekeeping: z.boolean().optional(),
  recruitmentDate: z.string().optional(),
  startDate: z.string().optional(),
});

type FormValues = z.infer<typeof staffFormSchema>;

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Staff | null;
  mode?: 'view' | 'edit' | 'create';
}

export function StaffFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  mode = editData ? 'edit' : 'create',
}: StaffFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salaryTemplates, setSalaryTemplates] = useState<SalaryTemplate[]>([]);

  const isEditMode = !!editData;
  const isViewMode = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      displayName: '',
      staffCode: '',
      employeeStatus: EmployeeStatus.WORKING,
      staffPhase: StaffPhase.PROBATION,
      requireAttendance: true,
      allowExternalIpTimekeeping: false,
    },
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await salaryTemplateApi.getAll();
        setSalaryTemplates(templates);
      } catch (error) {
        console.error("Failed to load salary templates", error);
      }
    };
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        form.reset({
          firstName: editData.firstName || '',
          lastName: editData.lastName || '',
          displayName: editData.displayName || '',
          email: editData.email || '',
          phoneNumber: editData.phoneNumber || '',
          gender: editData.gender ?? 0,
          idNumber: editData.idNumber || '',

          staffCode: editData.staffCode,
          employeeStatus: editData.employeeStatus ?? EmployeeStatus.WORKING,
          staffPhase: editData.staffPhase ?? StaffPhase.PROBATION,
          salaryTemplateId: editData.salaryTemplate?.id,
          requireAttendance: editData.requireAttendance ?? true,
          allowExternalIpTimekeeping: editData.allowExternalIpTimekeeping ?? false,
          recruitmentDate: editData.recruitmentDate ? new Date(editData.recruitmentDate).toISOString().split('T')[0] : '',
          startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
        });
      } else {
        form.reset({
          displayName: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          gender: 0,
          staffCode: '',
          employeeStatus: EmployeeStatus.WORKING,
          staffPhase: StaffPhase.PROBATION,
          requireAttendance: true,
          allowExternalIpTimekeeping: false,
          salaryTemplateId: undefined,
          recruitmentDate: '',
          startDate: '',
        });
      }
    }
  }, [isOpen, editData, form]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData: StaffFormData = {
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        displayName: values.displayName || '',
        gender: values.gender ?? 0,
        email: values.email,
        phoneNumber: values.phoneNumber,
        idNumber: values.idNumber,
        staffCode: values.staffCode || '',
        employeeStatus: values.employeeStatus,
        staffPhase: values.staffPhase,
        requireAttendance: values.requireAttendance,
        allowExternalIpTimekeeping: values.allowExternalIpTimekeeping,
        recruitmentDate: values.recruitmentDate,
        startDate: values.startDate,
        salaryTemplate: values.salaryTemplateId ? { id: values.salaryTemplateId } : undefined,
      };

      if (isEditMode && editData) {
        await staffApi.update(editData.id, formData);
        toast({
          title: 'Thành công',
          description: 'Cập nhật nhân viên thành công',
          variant: 'default',
        });
      } else {
        await staffApi.create(formData);
        toast({
          title: 'Thành công',
          description: 'Tạo mới nhân viên thành công',
          variant: 'default',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'Chi tiết nhân viên' : isEditMode ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Personal Info */}
              <FormField
                control={form.control}
                name="staffCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã nhân viên <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên đệm</FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
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
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Staff Info */}
              <FormField
                control={form.control}
                name="salaryTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mẫu lương</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mẫu lương" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salaryTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={String(EmployeeStatus.WORKING)}>Đang làm việc</SelectItem>
                        <SelectItem value={String(EmployeeStatus.RESIGNED)}>Đã nghỉ việc</SelectItem>
                        <SelectItem value={String(EmployeeStatus.ON_LEAVE)}>Nghỉ phép</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staffPhase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giai đoạn</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giai đoạn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={String(StaffPhase.PROBATION)}>Thử việc</SelectItem>
                        <SelectItem value={String(StaffPhase.OFFICIAL)}>Chính thức</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recruitmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày tuyển dụng</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
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
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="requireAttendance"
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
                      <FormLabel>Yêu cầu chấm công</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowExternalIpTimekeeping"
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
                      <FormLabel>Cho phép chấm công ngoài IP</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
