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
import { SystemConfig, SystemConfigFormData, CONFIG_TYPE_OPTIONS } from '@/types/system-config';

const systemConfigFormSchema = z.object({
    code: z.string().optional(),
    name: z.string().min(1, { message: 'Tên cấu hình là bắt buộc' }),
    description: z.string().optional(),
    configKey: z.string().min(1, { message: 'Config Key là bắt buộc' }),
    configValue: z.string().optional(),
    numberOfZero: z.number().optional().nullable(),
    note: z.string().optional(),
    configType: z.number().optional().nullable(),
});

type SystemConfigFormValues = z.infer<typeof systemConfigFormSchema>;

interface SystemConfigFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config?: SystemConfig | null;
    isLoading?: boolean;
    onSubmit: (data: SystemConfigFormData) => void;
    mode?: 'view' | 'edit' | 'create';
}

export function SystemConfigFormModal({
    open,
    onOpenChange,
    config,
    isLoading = false,
    onSubmit,
    mode = 'create',
}: SystemConfigFormModalProps) {
    const isEditing = !!config && mode !== 'view';
    const isViewMode = mode === 'view';

    const form = useForm<SystemConfigFormValues>({
        resolver: zodResolver(systemConfigFormSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            configKey: '',
            configValue: '',
            numberOfZero: null,
            note: '',
            configType: null,
        },
    });

    useEffect(() => {
        if (open) {
            if (config) {
                form.reset({
                    code: config.code || '',
                    name: config.name || '',
                    description: config.description || '',
                    configKey: config.configKey || '',
                    configValue: config.configValue || '',
                    numberOfZero: config.numberOfZero ?? null,
                    note: config.note || '',
                    configType: config.configType ?? null,
                });
            } else {
                form.reset({
                    code: '',
                    name: '',
                    description: '',
                    configKey: '',
                    configValue: '',
                    numberOfZero: null,
                    note: '',
                    configType: null,
                });
            }
        }
    }, [config, form, open]);

    const handleSubmit = (data: SystemConfigFormValues) => {
        if (isViewMode) return;
        onSubmit({
            id: config?.id,
            code: data.code || undefined,
            name: data.name,
            description: data.description || undefined,
            configKey: data.configKey,
            configValue: data.configValue || undefined,
            numberOfZero: data.numberOfZero ?? undefined,
            note: data.note || undefined,
            configType: data.configType ?? undefined,
        });
    };

    const getDialogTitle = () => {
        if (isViewMode) return 'Chi tiết cấu hình';
        return isEditing ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới';
    };

    const getDialogDescription = () => {
        if (isViewMode) return 'Thông tin chi tiết cấu hình hệ thống';
        return isEditing ? 'Cập nhật thông tin cấu hình' : 'Điền thông tin để tạo cấu hình mới';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>{getDialogDescription()}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã cấu hình</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: CFG-001" {...field} disabled={isViewMode} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="configType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại cấu hình</FormLabel>
                                        <Select
                                            disabled={isViewMode}
                                            onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                                            value={field.value?.toString() || ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại cấu hình" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CONFIG_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value.toString()}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên cấu hình *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: Số lần đăng nhập tối đa" {...field} disabled={isViewMode} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="configKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Config Key *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: MAX_LOGIN_ATTEMPTS" {...field} disabled={isViewMode} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="configValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Config Value</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Giá trị cấu hình..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            disabled={isViewMode}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numberOfZero"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng số 0</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="VD: 5"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                            disabled={isViewMode}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghi chú</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ghi chú thêm..."
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                            disabled={isViewMode}
                                        />
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
                                        <Textarea
                                            placeholder="Mô tả chi tiết về cấu hình..."
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                            disabled={isViewMode}
                                        />
                                    </FormControl>
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
