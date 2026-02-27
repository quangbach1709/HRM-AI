import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Person, PersonFormData, genderOptions, maritalStatusOptions, educationLevelOptions } from '@/types/person';
import { personApi } from '@/services/personApi';
import { useToast } from '@/hooks/use-toast';

const personFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().min(2, { message: 'Tên hiển thị phải có ít nhất 2 ký tự' }),
  email: z.string().min(1, { message: 'Email là bắt buộc' }).email({ message: 'Email không hợp lệ' }),
  phoneNumber: z.string().optional(),
  gender: z.number().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  idNumber: z.string().optional(),
  idNumberIssueDate: z.string().optional(),
  idNumberIssueBy: z.string().optional(),
  taxCode: z.string().optional(),
  maritalStatus: z.number().optional(),
  educationLevel: z.number().optional(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
});

type PersonFormValues = z.infer<typeof personFormSchema>;

interface PersonFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
  isLoading?: boolean;
  onSubmit: (data: PersonFormData) => Promise<void>;
  mode?: 'view' | 'edit' | 'create';
}

export function PersonFormModal({
  open,
  onOpenChange,
  person,
  isLoading: externalLoading,
  onSubmit,
  mode = person ? 'edit' : 'create',
}: PersonFormModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!person;
  const isViewMode = mode === 'view';

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      gender: 0,
      email: '',
      phoneNumber: '',
      idNumber: '',
      taxCode: '',
      birthPlace: '',
      idNumberIssueBy: '',
      maritalStatus: 0,
      educationLevel: 0,
      height: null,
      weight: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (person) {
        form.reset({
          firstName: person.firstName || '',
          lastName: person.lastName || '',
          displayName: person.displayName || '',
          gender: person.gender ?? 0,
          email: person.email || '',
          phoneNumber: person.phoneNumber || '',
          idNumber: person.idNumber || '',
          taxCode: person.taxCode || '',
          birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : '',
          birthPlace: person.birthPlace || '',
          idNumberIssueDate: person.idNumberIssueDate ? new Date(person.idNumberIssueDate).toISOString().split('T')[0] : '',
          idNumberIssueBy: person.idNumberIssueBy || '',
          maritalStatus: person.maritalStatus ?? 0,
          educationLevel: person.educationLevel ?? 0,
          height: person.height ?? null,
          weight: person.weight ?? null,
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          displayName: '',
          gender: 0,
          email: '',
          phoneNumber: '',
          idNumber: '',
          taxCode: '',
          birthDate: '',
          birthPlace: '',
          idNumberIssueDate: '',
          idNumberIssueBy: '',
          maritalStatus: 0,
          educationLevel: 0,
          height: null,
          weight: null,
        });
      }
    }
  }, [person, open, form]);

  const handleSubmit = async (data: PersonFormValues) => {
    setIsLoading(true);
    try {
      const formData: PersonFormData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        displayName: data.displayName,
        gender: data.gender ?? 0,
        email: data.email,
        phoneNumber: data.phoneNumber,
        idNumber: data.idNumber,
        taxCode: data.taxCode,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
        birthPlace: data.birthPlace,
        idNumberIssueDate: data.idNumberIssueDate ? new Date(data.idNumberIssueDate).toISOString() : undefined,
        idNumberIssueBy: data.idNumberIssueBy,
        maritalStatus: data.maritalStatus,
        educationLevel: data.educationLevel,
        height: data.height,
        weight: data.weight,
      };

      await onSubmit(formData);
      onOpenChange(false);
    } catch (err: any) {
      // Error handling is done in the parent component
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingState = externalLoading !== undefined ? externalLoading : isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết nhân viên' : isEditing ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? 'Xem thông tin chi tiết nhân viên'
              : isEditing ? 'Cập nhật thông tin nhân viên' : 'Điền thông tin để tạo nhân viên mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Họ và đệm</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn" disabled={isViewMode} {...field} />
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
                      <Input placeholder="A" disabled={isViewMode} {...field} />
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
                      <Input placeholder="Nguyễn Văn A" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                  <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
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
                name="birthDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nơi sinh</FormLabel>
                    <FormControl>
                      <Input placeholder="Nơi sinh" disabled={isViewMode} {...field} />
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
                      <Input type="email" placeholder="example@email.com" disabled={isViewMode} {...field} />
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
                      <Input placeholder="09xxxxxxx" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>CCCD/CMND</FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumberIssueDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Ngày cấp CCCD/CMND</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumberIssueBy"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nơi cấp CCCD/CMND</FormLabel>
                    <FormControl>
                      <Input placeholder="Nơi cấp" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trình độ học vấn</FormLabel>
                  <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trình độ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationLevelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
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
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng hôn nhân</FormLabel>
                  <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tình trạng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maritalStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
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
                name="height"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Chiều cao (cm) (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isViewMode} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cân nặng (kg) (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={isViewMode} {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoadingState}
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={isLoadingState}>
                  {isLoadingState && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
