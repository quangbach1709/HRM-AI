import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { salaryNotificationApi } from '@/services/salaryNotificationApi';
import { staffApi } from '@/services/staffApi';
import { salaryPeriodApi } from '@/services/salaryPeriodApi';
import { Staff } from '@/types/staff';
import { SalaryPeriod } from '@/types/salaryPeriod';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    staffId: z.string().optional(),
    isAllStaff: z.boolean().default(false),
    salaryPeriodId: z.string().min(1, 'Vui lòng chọn kỳ lương'),
}).refine((data) => data.isAllStaff || (data.staffId && data.staffId.length > 0), {
    message: "Vui lòng chọn nhân viên hoặc chọn 'Tất cả nhân viên'",
    path: ["staffId"],
});

interface SendSalaryEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    // Optional: pre-fill values when triggered from CalculateSalaryModal
    defaultStaffId?: string;
    defaultSalaryPeriodId?: string;
}

export function SendSalaryEmailModal({
    open,
    onOpenChange,
    onSuccess,
    defaultStaffId,
    defaultSalaryPeriodId,
}: SendSalaryEmailModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [salaryPeriods, setSalaryPeriods] = useState<SalaryPeriod[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            staffId: defaultStaffId || '',
            isAllStaff: false,
            salaryPeriodId: defaultSalaryPeriodId || '',
        },
    });

    const isAllStaff = form.watch('isAllStaff');

    // Fetch dropdown data
    useEffect(() => {
        if (open) {
            Promise.all([
                staffApi.getAll(),
                salaryPeriodApi.getAllList()
            ]).then(([staffData, periodData]) => {
                setStaffList(staffData);
                setSalaryPeriods(periodData);
            }).catch(console.error);

            // Reset form when modal opens
            form.reset({
                staffId: defaultStaffId || '',
                isAllStaff: false,
                salaryPeriodId: defaultSalaryPeriodId || '',
            });
            setIsSuccess(false);
        }
    }, [open, form, defaultStaffId, defaultSalaryPeriodId]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            await salaryNotificationApi.sendSalaryEmail({
                staffId: values.isAllStaff ? undefined : values.staffId,
                salaryPeriodId: values.salaryPeriodId,
                isAllStaff: values.isAllStaff,
            });
            setIsSuccess(true);
            toast({
                title: "Thành công",
                description: "Đã gửi yêu cầu thông báo lương qua email!",
            });
            onSuccess?.();
        } catch (error: any) {
            console.error('Send email error:', error);
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Không thể gửi email thông báo lương",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Gửi thông báo lương qua Email
                    </DialogTitle>
                    <DialogDescription>
                        Chọn nhân viên và kỳ lương để gửi thông báo lương
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="isAllStaff"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading || isSuccess}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Gửi cho tất cả nhân viên
                                        </FormLabel>
                                        <FormDescription>
                                            Chọn tùy chọn này để gửi thông báo cho toàn bộ nhân viên có dữ liệu lương
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="staffId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhân viên {!isAllStaff && <span className="text-red-500">*</span>}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoading || isAllStaff || isSuccess}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isAllStaff ? "Đã chọn tất cả nhân viên" : "Chọn nhân viên"} />
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

                        <FormField
                            control={form.control}
                            name="salaryPeriodId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kỳ lương <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoading || isSuccess}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn kỳ lương" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {salaryPeriods.map((period) => (
                                                <SelectItem key={period.id} value={period.id}>
                                                    {period.name || period.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Success message */}
                        {isSuccess && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold">Đã gửi yêu cầu thành công!</span>
                                </div>
                                <p className="text-sm text-green-600 mt-1">
                                    Hệ thống đang xử lý gửi email. Nhân viên sẽ nhận được thông báo trong giây lát.
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                {isSuccess ? 'Đóng' : 'Hủy'}
                            </Button>
                            {!isSuccess && (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Gửi Email
                                        </>
                                    )}
                                </Button>
                            )}
                            {isSuccess && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsSuccess(false);
                                        form.reset();
                                    }}
                                >
                                    Gửi tiếp
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
