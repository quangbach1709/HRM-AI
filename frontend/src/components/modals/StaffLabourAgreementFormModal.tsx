import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
    StaffLabourAgreement,
    StaffLabourAgreementFormData,
    ContractType,
    AgreementStatus
} from '@/types/staffLabourAgreement';
import { Staff } from '@/types/staff';
import { staffLabourAgreementApi } from '@/services/staffLabourAgreementApi';
import { staffApi } from '@/services/staffApi';

const formSchema = z.object({
    staffId: z.string().min(1, 'Vui lòng chọn nhân viên'),
    labourAgreementNumber: z.string().min(1, 'Số hợp đồng là bắt buộc'),
    contractType: z.number(),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().optional(),
    durationMonths: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().optional()),
    workingHour: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().optional()),
    workingHourWeekMin: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().optional()),
    salary: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(0, 'Lương không được âm')),
    signedDate: z.string().optional(),
    agreementStatus: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffLabourAgreementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: StaffLabourAgreement | null;
    mode?: 'view' | 'edit' | 'create';
}

export function StaffLabourAgreementFormModal({
    isOpen,
    onClose,
    onSuccess,
    editData,
    mode = 'create',
}: StaffLabourAgreementFormModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);

    const isEditMode = !!editData && mode !== 'view';
    const isViewMode = mode === 'view';

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            staffId: '',
            labourAgreementNumber: '',
            contractType: ContractType.PROBATION,
            startDate: '',
            salary: undefined,
            agreementStatus: AgreementStatus.UNSIGNED,
            durationMonths: undefined,
            workingHour: 8,
            workingHourWeekMin: 40,
            signedDate: '',
        },
    });

    // Load staff list
    useEffect(() => {
        if (isOpen) {
            staffApi.getAll().then((data: unknown) => {
                if (Array.isArray(data)) {
                    setStaffList(data as Staff[]);
                } else if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content: unknown }).content)) {
                    setStaffList((data as { content: Staff[] }).content);
                }
            }).catch(console.error);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                form.reset({
                    staffId: editData.staff.id,
                    labourAgreementNumber: editData.labourAgreementNumber,
                    contractType: editData.contractType,
                    startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
                    endDate: editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '',
                    durationMonths: editData.durationMonths,
                    workingHour: editData.workingHour,
                    workingHourWeekMin: editData.workingHourWeekMin,
                    salary: editData.salary,
                    signedDate: editData.signedDate ? new Date(editData.signedDate).toISOString().split('T')[0] : '',
                    agreementStatus: editData.agreementStatus,
                });
            } else {
                form.reset({
                    staffId: '',
                    labourAgreementNumber: '',
                    contractType: ContractType.PROBATION,
                    startDate: '',
                    salary: undefined,
                    agreementStatus: AgreementStatus.UNSIGNED,
                    durationMonths: undefined,
                    workingHour: 8,
                    workingHourWeekMin: 40,
                    signedDate: '',
                });
            }
        }
    }, [isOpen, editData, form]);

    const handleSubmit = async (values: FormValues) => {
        if (isViewMode) return;
        
        setLoading(true);
        try {
            const formData: StaffLabourAgreementFormData = {
                ...values,
                staff: { id: values.staffId },
                labourAgreementNumber: values.labourAgreementNumber,
                startDate: values.startDate,
                salary: Number(values.salary),
                contractType: Number(values.contractType),
                agreementStatus: Number(values.agreementStatus),
                durationMonths: values.durationMonths ? Number(values.durationMonths) : undefined,
                workingHour: values.workingHour ? Number(values.workingHour) : undefined,
                workingHourWeekMin: values.workingHourWeekMin ? Number(values.workingHourWeekMin) : undefined,
                signedDate: values.signedDate || undefined,
            };

            if (isEditMode && editData) {
                await staffLabourAgreementApi.update(editData.id, formData);
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật hợp đồng thành công',
                    variant: 'default',
                });
            } else {
                await staffLabourAgreementApi.create(formData);
                toast({
                    title: 'Thành công',
                    description: 'Tạo mới hợp đồng thành công',
                    variant: 'default',
                });
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as Error | undefined;
            const errorMessage = err?.message || 'Có lỗi xảy ra';
            toast({
                title: 'Lỗi',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getDialogTitle = () => {
        if (isViewMode) return 'Chi tiết hợp đồng';
        return isEditMode ? 'Cập nhật hợp đồng' : 'Thêm mới hợp đồng';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        {/* Staff Selection */}
                        <FormField
                            control={form.control}
                            name="staffId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhân viên</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode || isViewMode}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {staffList.map((staff) => (
                                                <SelectItem key={staff.id} value={staff.id}>
                                                    {staff.staffCode} - {staff.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="labourAgreementNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số hợp đồng</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isViewMode} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contractType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại hợp đồng</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()} disabled={isViewMode}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại hợp đồng" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={String(ContractType.PROBATION)}>Thử việc</SelectItem>
                                                <SelectItem value={String(ContractType.OFFICIAL)}>Chính thức</SelectItem>
                                                <SelectItem value={String(ContractType.SEASONAL)}>Thời vụ</SelectItem>
                                                <SelectItem value={String(ContractType.FIXED_TERM)}>Xác định thời hạn</SelectItem>
                                                <SelectItem value={String(ContractType.UNLIMITED_TERM)}>Không xác định thời hạn</SelectItem>
                                            </SelectContent>
                                        </Select>
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

                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mức lương</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                disabled={isViewMode}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="agreementStatus"
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
                                                <SelectItem value={String(AgreementStatus.UNSIGNED)}>Chưa ký</SelectItem>
                                                <SelectItem value={String(AgreementStatus.SIGNED)}>Đã ký</SelectItem>
                                                <SelectItem value={String(AgreementStatus.TERMINATED)}>Chấm dứt</SelectItem>
                                                <SelectItem value={String(AgreementStatus.EXPIRED)}>Hết hạn</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="durationMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời hạn (tháng)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
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
                                        <FormLabel>Giờ công chuẩn/ngày</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
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
                                        <FormLabel>Giờ công tối thiểu/tuần</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                disabled={isViewMode}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="signedDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày ký</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} disabled={isViewMode} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                {isViewMode ? 'Đóng' : 'Huỷ'}
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
