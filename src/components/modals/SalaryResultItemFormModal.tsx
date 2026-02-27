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
import { SalaryResultItem, SalaryResultItemFormData } from '@/types/salaryResultItem';

const formSchema = z.object({
    salaryResultId: z.string().min(1, 'Vui lòng chọn bảng lương'),
    staffId: z.string().min(1, 'Vui lòng chọn nhân viên'),
});

interface SalaryResultItemFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: SalaryResultItem | null;
    salaryResults: Array<{ id: string; name: string }>;
    staffList: Array<{ id: string; staffCode: string; displayName: string }>;
    isLoading?: boolean;
    onSubmit: (data: SalaryResultItemFormData) => Promise<void>;
    mode?: 'view' | 'edit' | 'create';
}

export function SalaryResultItemFormModal({
    open,
    onOpenChange,
    data,
    salaryResults,
    staffList,
    isLoading,
    onSubmit,
    mode = 'create',
}: SalaryResultItemFormModalProps) {
    const isEditMode = !!data && mode !== 'view';
    const isViewMode = mode === 'view';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            salaryResultId: '',
            staffId: '',
        },
    });

    useEffect(() => {
        if (open) {
            if (data) {
                form.reset({
                    salaryResultId: data.salaryResult?.id || '',
                    staffId: data.staff?.id || '',
                });
            } else {
                form.reset({
                    salaryResultId: '',
                    staffId: '',
                });
            }
        }
    }, [open, data, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        if (isViewMode) return;
        await onSubmit({
            id: data?.id,
            salaryResultId: values.salaryResultId,
            staffId: values.staffId,
        });
    };

    const getDialogTitle = () => {
        if (isViewMode) return 'Chi tiết bảng lương nhân viên';
        return isEditMode ? 'Cập nhật chi tiết bảng lương' : 'Thêm nhân viên vào bảng lương';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="salaryResultId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bảng lương <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isViewMode}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn bảng lương" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {salaryResults.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name}
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
                            name="staffId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhân viên <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isViewMode}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {staffList.map((item) => (
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
