import React, { useState, useEffect } from 'react';
import { StaffWorkSchedule, StaffWorkScheduleFormData } from '../../types/staffWorkSchedule';
import { staffWorkScheduleApi } from '../../services/staffWorkScheduleApi';
import { staffApi } from '../../services/staffApi';
import { Staff } from '../../types/staff';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface StaffWorkScheduleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: StaffWorkSchedule | null;
    mode?: 'view' | 'edit' | 'create';
}

// Frontend constants matching backend HRConstants
const SHIFT_WORK_TYPES = [
    { value: 1, label: 'Ca sáng' },
    { value: 2, label: 'Ca chiều' },
    { value: 3, label: 'Ca nguyên ngày' },
];

const SHIFT_WORK_STATUSES = [
    { value: 1, label: 'Khởi tạo' },
    { value: 2, label: 'Đã check in' },
    { value: 3, label: 'Đi làm thiếu giờ' },
    { value: 4, label: 'Đi làm đủ giờ' },
    { value: 5, label: 'Nghỉ' },
    { value: 6, label: 'Chưa đến ngày làm việc' },
];

const initialFormData: StaffWorkScheduleFormData = {
    staffId: '',
    shiftWorkType: 1,
    shiftWorkStatus: 1,
    checkIn: '',
    checkOut: '',
    workingDate: '',
    isLocked: false,
};

export function StaffWorkScheduleFormModal({
    isOpen,
    onClose,
    onSuccess,
    editData,
    mode = 'create',
}: StaffWorkScheduleFormModalProps) {
    const [formData, setFormData] = useState<StaffWorkScheduleFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const { toast } = useToast();

    const isEditMode = !!editData && mode !== 'view';
    const isViewMode = mode === 'view';

    // Fetch Staff List when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoadingStaff(true);
            staffApi.getAll()
                .then(setStaffList)
                .catch((err) => {
                    console.error('Error fetching staff list:', err);
                    toast({ title: 'Lỗi', description: 'Không thể tải danh sách nhân viên', variant: 'destructive' });
                })
                .finally(() => setLoadingStaff(false));
        }
    }, [isOpen]);

    useEffect(() => {
        if (editData) {
            setFormData({
                id: editData.id,
                staffId: editData.staff?.id,
                shiftWorkType: editData.shiftWorkType ?? 1,
                shiftWorkStatus: editData.shiftWorkStatus ?? 1,
                checkIn: editData.checkIn ? new Date(editData.checkIn).toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace('24:', '00:') : '',
                checkOut: editData.checkOut ? new Date(editData.checkOut).toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace('24:', '00:') : '',
                workingDate: editData.workingDate ? new Date(editData.workingDate).toISOString().split('T')[0] : '',
                isLocked: editData.isLocked,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [editData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        // Convert to number if needed for type/status fields
        if (name === 'shiftWorkType' || name === 'shiftWorkStatus') {
            setFormData((prev) => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isViewMode) return;

        if (!formData.staffId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn nhân viên', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            // Prepare data for submission: combine workingDate with checkIn/checkOut times
            const workingDateStr = formData.workingDate || new Date().toISOString().split('T')[0];
            
            const submitData = {
                ...formData,
                checkIn: formData.checkIn ? `${workingDateStr}T${formData.checkIn}:00` : undefined,
                checkOut: formData.checkOut ? `${workingDateStr}T${formData.checkOut}:00` : undefined,
            };

            if (isEditMode && editData) {
                await staffWorkScheduleApi.update(editData.id, submitData);
                toast({ title: 'Cập nhật thành công', variant: 'default' });
            } else {
                await staffWorkScheduleApi.create(submitData);
                toast({ title: 'Tạo mới thành công', variant: 'default' });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            toast({ title: 'Lỗi', description: message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getDialogTitle = () => {
        if (isViewMode) return 'Chi tiết phân ca';
        return isEditMode ? 'Cập nhật phân ca' : 'Thêm mới phân ca';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Staff Select */}
                        <div className="space-y-2">
                            <Label>Nhân viên</Label>
                            <Select
                                value={formData.staffId || ''}
                                onValueChange={(value) => handleSelectChange('staffId', value)}
                                disabled={loadingStaff || isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingStaff ? 'Đang tải...' : 'Chọn nhân viên'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffList.map((staff) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.displayName || staff.staffCode} ({staff.staffCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shift Work Type Select */}
                        <div className="space-y-2">
                            <Label>Loại ca</Label>
                            <Select
                                value={String(formData.shiftWorkType || 1)}
                                onValueChange={(value) => handleSelectChange('shiftWorkType', value)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại ca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHIFT_WORK_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={String(type.value)}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time (checkIn) */}
                        <div className="space-y-2">
                            <Label>Giờ check in</Label>
                            <Input
                                type="time"
                                name="checkIn"
                                value={formData.checkIn || ''}
                                onChange={handleChange}
                                disabled={isViewMode}
                            />
                        </div>

                        {/* End Time (checkOut) */}
                        <div className="space-y-2">
                            <Label>Giờ check out</Label>
                            <Input
                                type="time"
                                name="checkOut"
                                value={formData.checkOut || ''}
                                onChange={handleChange}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Working Date */}
                        <div className="space-y-2">
                            <Label>Ngày làm việc</Label>
                            <Input
                                type="date"
                                name="workingDate"
                                value={formData.workingDate || ''}
                                onChange={handleChange}
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Shift Work Status Select */}
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={String(formData.shiftWorkStatus || 1)}
                                onValueChange={(value) => handleSelectChange('shiftWorkStatus', value)}
                                disabled={isViewMode}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHIFT_WORK_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={String(status.value)}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {isViewMode ? 'Đóng' : 'Huỷ'}
                        </Button>
                        {!isViewMode && (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
