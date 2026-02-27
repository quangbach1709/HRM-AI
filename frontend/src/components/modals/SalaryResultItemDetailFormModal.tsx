import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { SalaryResultItemDetail, SalaryResultItemDetailFormData } from '@/types/salaryResultItemDetail';

const formSchema = z.object({
    salaryResultItemId: z.string().min(1, 'Vui lòng chọn chi tiết bảng lương'),
    salaryTemplateItemId: z.string().min(1, 'Vui lòng chọn thành phần lương'),
    value: z.coerce.number().min(0, 'Giá trị không được âm'),
});

interface SalaryResultItemDetailFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: SalaryResultItemDetail | null;
    salaryResultItems: Array<{ id: string; staffCode?: string; displayName?: string }>;
    salaryTemplateItems: Array<{ id: string; name: string; code?: string }>;
    isLoading?: boolean;
    onSubmit: (data: SalaryResultItemDetailFormData) => Promise<void>;
    mode?: 'create' | 'edit' | 'view';
}

export function SalaryResultItemDetailFormModal({
    open,
    onOpenChange,
    data,
    salaryResultItems,
    salaryTemplateItems,
    isLoading,
    onSubmit,
    mode,
}: SalaryResultItemDetailFormModalProps) {
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit' || (!!data && mode !== 'view');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            salaryResultItemId: '',
            salaryTemplateItemId: '',
            value: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (data) {
                form.reset({
                    salaryResultItemId: data.salaryResultItem?.id || '',
                    salaryTemplateItemId: data.salaryTemplateItem?.id || '',
                    value: data.value || 0,
                });
            } else {
                form.reset({
                    salaryResultItemId: '',
                    salaryTemplateItemId: '',
                    value: 0,
                });
            }
        }
    }, [open, data, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit({
            id: data?.id,
            salaryResultItemId: values.salaryResultItemId,
            salaryTemplateItemId: values.salaryTemplateItemId,
            value: values.value,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isViewMode ? 'Chi tiết khoản lương' : isEditMode ? 'Cập nhật chi tiết khoản lương' : 'Thêm chi tiết khoản lương'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="salaryResultItemId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chi tiết bảng lương nhân viên <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isViewMode}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn chi tiết bảng lương" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {salaryResultItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.staffCode} - {item.displayName}
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
                            name="salaryTemplateItemId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thành phần lương <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isViewMode}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn thành phần lương" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {salaryTemplateItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.code ? `${item.code} - ` : ''}{item.name}
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
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá trị <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="1000"
                                            placeholder="Nhập giá trị"
                                            disabled={isViewMode}
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-sm text-muted-foreground">
                                        {field.value ? formatCurrency(field.value) + ' VNĐ' : ''}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {isViewMode ? 'Đóng' : 'Hủy'}
                            </Button>
                            {!isViewMode && (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Thêm mới'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
