import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { staffWorkScheduleApi } from '@/services/staffWorkScheduleApi';
import { StaffWorkSchedule, SearchStaffWorkScheduleDto } from '@/types/staffWorkSchedule';
import { AttendanceCheckInModal } from '@/components/modals/AttendanceCheckInModal';

// Status constants matching backend HRConstants.ShiftWorkStatus
const SHIFT_WORK_STATUS = {
    CREATED: 1,
    CHECKED_IN: 2,
    INSUFFICIENT_HOURS: 3,
    WORKED_FULL_HOURS: 4,
    ABSENT: 5,
    NOT_YET_DUE: 6,
};

const STATUS_COLORS: Record<number, { bg: string; text: string; label: string }> = {
    [SHIFT_WORK_STATUS.CREATED]: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Khởi tạo' },
    [SHIFT_WORK_STATUS.CHECKED_IN]: { bg: 'bg-blue-200', text: 'text-blue-700', label: 'Đã check in' },
    [SHIFT_WORK_STATUS.INSUFFICIENT_HOURS]: { bg: 'bg-yellow-200', text: 'text-yellow-700', label: 'Thiếu giờ' },
    [SHIFT_WORK_STATUS.WORKED_FULL_HOURS]: { bg: 'bg-green-200', text: 'text-green-700', label: 'Đủ giờ' },
    [SHIFT_WORK_STATUS.ABSENT]: { bg: 'bg-red-200', text: 'text-red-700', label: 'Nghỉ' },
    [SHIFT_WORK_STATUS.NOT_YET_DUE]: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Chưa đến' },
};

const SHIFT_WORK_TYPES: Record<number, string> = {
    1: 'Sáng',
    2: 'Chiều',
    3: 'Cả ngày',
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function MyAttendance() {
    const { user, staff } = useAuth();
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState<StaffWorkSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get staffId from localStorage hrm_staff or fallback to context
    const getStaffId = (): string | null => {
        // Try from AuthContext staff (which is synced with localStorage hrm_staff)
        if (staff?.id) return staff.id;
        
        // Fallback: read directly from localStorage
        try {
            const storedStaff = localStorage.getItem('hrm_staff');
            if (storedStaff) {
                const staffData = JSON.parse(storedStaff);
                return staffData?.id || null;
            }
        } catch (e) {
            console.error('Error reading hrm_staff from localStorage:', e);
        }
        
        // Last fallback: use user.staffId
        return user?.staffId || null;
    };

    // Format date to YYYY-MM-DD local time
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: { date: number | null; fullDate: string | null }[] = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ date: null, fullDate: null });
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({
                date: day,
                fullDate: formatDateLocal(date),
            });
        }

        return days;
    }, [year, month]);

    // Fetch attendance data for the month
    const fetchAttendanceData = async () => {
        const staffId = getStaffId();
        if (!staffId) return;

        setLoading(true);
        try {
            // Calculate start and end of month in Local Time with time components
            const startOfMonth = new Date(year, month, 1, 0, 0, 0);
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

            // Send ISO strings (which are UTC) to backend to ensure full coverage
            const fromDate = startOfMonth.toISOString();
            const toDate = endOfMonth.toISOString();

            const params: SearchStaffWorkScheduleDto = {
                staffId: staffId,
                pageIndex: 0,
                // Ensure we get all days (31 days max, 100 safe buffer)
                pageSize: 100,
                sortBy: 'workingDate',
                sortDirection: 'ASC',
                voided: false,
                fromDate: fromDate,
                toDate: toDate,
            };

            const response = await staffWorkScheduleApi.search(params);
            setAttendanceData(response.content || []);
        } catch (err: any) {
            console.error('Error fetching attendance:', err);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải dữ liệu chấm công',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when staffId or month changes
    useEffect(() => {
        fetchAttendanceData();
    }, [staff?.id, user?.staffId, year, month]);

    // Get attendance data for a specific date
    const getAttendanceForDate = (dateStr: string | null): StaffWorkSchedule | undefined => {
        if (!dateStr) return undefined;
        return attendanceData.find(item => {
            if (!item.workingDate) return false;
            // Convert backend date -> Local Date -> YYYY-MM-DD string to compare
            const itemDateLocal = formatDateLocal(new Date(item.workingDate));
            return itemDateLocal === dateStr;
        });
    };

    // Navigation handlers
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Check if a date is today
    const isToday = (dateStr: string | null): boolean => {
        if (!dateStr) return false;
        return dateStr === formatDateLocal(new Date());
    };

    const handleCheckInSuccess = () => {
        fetchAttendanceData();
    };

    const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Chấm công"
                description="Theo dõi tình trạng chấm công của bạn"
            />

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Clock className="w-4 h-4" />
                    Chấm công
                </Button>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={goToToday} className="min-w-[150px]">
                        {monthName}
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {/* Weekday Headers */}
                            {WEEKDAYS.map((day) => (
                                <div
                                    key={day}
                                    className="text-center font-semibold text-sm py-2 text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Calendar Days */}
                            {calendarDays.map((dayInfo, index) => {
                                const attendance = getAttendanceForDate(dayInfo.fullDate);
                                const statusInfo = attendance?.shiftWorkStatus
                                    ? STATUS_COLORS[attendance.shiftWorkStatus]
                                    : null;
                                const shiftLabel = attendance?.shiftWorkType
                                    ? SHIFT_WORK_TYPES[attendance.shiftWorkType]
                                    : null;

                                return (
                                    <div
                                        key={index}
                                        className={`
                                            min-h-[80px] p-2 rounded-lg border transition-all
                                            ${dayInfo.date === null ? 'bg-transparent border-transparent' : 'border-border'}
                                            ${isToday(dayInfo.fullDate) ? 'ring-2 ring-primary' : ''}
                                            ${statusInfo ? statusInfo.bg : ''}
                                        `}
                                    >
                                        {dayInfo.date !== null && (
                                            <div className="h-full flex flex-col">
                                                <span className={`text-sm font-medium ${isToday(dayInfo.fullDate) ? 'text-primary' : ''}`}>
                                                    {dayInfo.date}
                                                </span>
                                                {attendance && (
                                                    <div className="mt-1 flex flex-col gap-1">
                                                        {shiftLabel && (
                                                            <Badge variant="secondary" className="text-xs w-fit">
                                                                {shiftLabel}
                                                            </Badge>
                                                        )}
                                                        {statusInfo && (
                                                            <span className={`text-xs ${statusInfo.text}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        )}
                                                        {attendance.checkIn && (
                                                            <span className="text-xs text-muted-foreground">
                                                                In: {new Date(attendance.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                        {attendance.checkOut && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Out: {new Date(attendance.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Chú thích trạng thái
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(STATUS_COLORS).map(([value, info]) => (
                            <div key={value} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${info.bg}`}></div>
                                <span className="text-sm">{info.label}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Check-in Modal */}
            <AttendanceCheckInModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCheckInSuccess}
            />
        </div>
    );
}
