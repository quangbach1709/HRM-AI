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
import { Calculator, CheckCircle, Mail } from 'lucide-react';
import { salaryResultApi, CalculateSalaryResponse, SalaryItemDetail } from '@/services/salaryResultApi';
import { staffApi } from '@/services/staffApi';
import { salaryPeriodApi } from '@/services/salaryPeriodApi';
import { Staff } from '@/types/staff';
import { SalaryPeriod } from '@/types/salaryPeriod';
import { Checkbox } from '@/components/ui/checkbox';
import { SendSalaryEmailModal } from './SendSalaryEmailModal';

const formSchema = z.object({
    staffId: z.string().optional(),
    isAllStaff: z.boolean().default(false),
    salaryPeriodId: z.string().min(1, 'Vui lòng chọn kỳ lương'),
}).refine((data) => data.isAllStaff || (data.staffId && data.staffId.length > 0), {
    message: "Vui lòng chọn nhân viên hoặc chọn 'Tất cả nhân viên'",
    path: ["staffId"],
});

interface CalculateSalaryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CalculateSalaryModal({
    open,
    onOpenChange,
    onSuccess,
}: CalculateSalaryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [salaryPeriods, setSalaryPeriods] = useState<SalaryPeriod[]>([]);
    const [result, setResult] = useState<CalculateSalaryResponse | null>(null);
    const [batchResult, setBatchResult] = useState<any | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            staffId: '',
            isAllStaff: false,
            salaryPeriodId: '',
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

            // Reset form and result when modal opens
            form.reset();
            setResult(null);
            setBatchResult(null);
        }
    }, [open, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setResult(null);
        setBatchResult(null);
        try {
            if (values.isAllStaff) {
                const response = await salaryResultApi.calculateSalaryAll(values.salaryPeriodId);
                setBatchResult(response);
            } else {
                const response = await salaryResultApi.calculateSalary(
                    values.staffId!,
                    values.salaryPeriodId
                );
                setResult(response);
            }
            onSuccess?.();
        } catch (error: any) {
            console.error('Calculate salary error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Các mã không phải tiền tệ (số ngày công, số lượng...)
    const nonCurrencyCodes = ['SO_NGAY_CONG_THUC_TE', 'SO_NGAY_CONG_TIEU_CHUAN'];

    const formatValue = (value: number, code?: string) => {
        if (code && nonCurrencyCodes.includes(code)) {
            return new Intl.NumberFormat('vi-VN', {
                maximumFractionDigits: 2,
            }).format(value) + ' ngày';
        }
        return formatCurrency(value);
    };

    const getSalaryItemTypeName = (type: number) => {
        switch (type) {
            case 1: return 'Giá trị';
            case 2: return 'Công thức';
            case 3: return 'Hệ thống';
            default: return 'Khác';
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Tính lương nhân viên
                        </DialogTitle>
                        <DialogDescription>
                            Chọn nhân viên và kỳ lương để tính toán tự động
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
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Tính cho tất cả nhân viên
                                            </FormLabel>
                                            <FormDescription>
                                                Chọn tùy chọn này để tính lương cho toàn bộ nhân viên trong hệ thống
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
                                            disabled={isLoading || isAllStaff}
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
                                            disabled={isLoading}
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

                            {/* Result display for single staff */}
                            {result && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3 text-green-700">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Tính lương thành công!</span>
                                    </div>

                                    <div className="mb-3 text-sm">
                                        <p><strong>Nhân viên:</strong> {result.staffCode} - {result.staffName}</p>
                                        <p><strong>Kỳ lương:</strong> {result.salaryPeriodName}</p>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Khoản lương</th>
                                                    <th className="px-3 py-2 text-left">Loại</th>
                                                    <th className="px-3 py-2 text-right">Giá trị</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.items
                                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                                    .map((item: SalaryItemDetail) => (
                                                        <tr key={item.salaryTemplateItemId} className="border-t">
                                                            <td className="px-3 py-2">
                                                                <div className="font-medium">{item.name}</div>
                                                                <div className="text-xs text-gray-500">{item.code}</div>
                                                            </td>
                                                            <td className="px-3 py-2 text-xs">
                                                                <span className={`px-2 py-0.5 rounded ${item.salaryItemType === 1 ? 'bg-blue-100 text-blue-700' :
                                                                    item.salaryItemType === 2 ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {getSalaryItemTypeName(item.salaryItemType)}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-mono">
                                                                {formatValue(item.value, item.code)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                            <tfoot className="bg-green-100 font-bold">
                                                <tr>
                                                    <td colSpan={2} className="px-3 py-2">Tổng thu nhập</td>
                                                    <td className="px-3 py-2 text-right font-mono text-green-700">
                                                        {formatCurrency(result.totalSalary)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Result display for batch calculation */}
                            {batchResult && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3 text-green-700">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Đã gửi yêu cầu tính lương!</span>
                                    </div>
                                    <p className="text-sm">Hệ thống đang xử lý tính lương cho tất cả nhân viên. Vui lòng kiểm tra lại danh sách sau ít phút.</p>
                                </div>
                            )}

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    {result || batchResult ? 'Đóng' : 'Hủy'}
                                </Button>
                                {!result && !batchResult && (
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Đang tính...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator className="w-4 h-4 mr-2" />
                                                Tính lương
                                            </>
                                        )}
                                    </Button>
                                )}
                                {(result || batchResult) && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                            onClick={() => setIsEmailModalOpen(true)}
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Gửi Email
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setResult(null);
                                                setBatchResult(null);
                                                form.reset();
                                            }}
                                        >
                                            Tính tiếp
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Send Email Modal */}
            <SendSalaryEmailModal
                open={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                defaultStaffId={result?.staffId}
                defaultSalaryPeriodId={form.getValues('salaryPeriodId')}
            />
        </>
    );
}

