import { useState } from 'react';
import { Shield, Users, Building2, FileText, UserPlus, Clock, RefreshCw, Activity, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/contexts/AuthContext';

// Danh sách tháng
const MONTHS = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
];

// Danh sách năm (5 năm gần đây)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function UnifiedDashboard() {
    const { hasRole, user } = useAuth();
    const {
        stats,
        loading,
        syncStats,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        monthKey
    } = useDashboardStats();

    const isAdmin = hasRole('admin');
    const isManager = hasRole('manager');
    const isHR = hasRole('hr');

    // Lấy dữ liệu từ MongoDB (camelCase từ Spring Boot JSON)
    const totalUsers = stats?.adminStats?.totalUsers ?? 0;
    const totalDepartments = stats?.managerStats?.totalDepartments ?? 0;
    const totalSalaryTemplates = stats?.managerStats?.totalSalaryTemplates ?? 0;
    const totalEmployees = stats?.hrStats?.totalEmployees ?? 0;
    const openPositions = stats?.hrStats?.openPositions ?? 0;
    const completedAttendance = stats?.hrStats?.completedAttendance ?? 0;

    const handleSync = async () => {
        try {
            await syncStats();
            alert('Đồng bộ dữ liệu thành công!');
        } catch {
            alert('Lỗi khi đồng bộ dữ liệu');
        }
    };

    // Chuyển tháng trước/sau
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Xác định tiêu đề dựa trên role
    const getTitle = () => {
        const roles = [];
        if (isAdmin) roles.push('Quản trị');
        if (isManager) roles.push('Quản lý');
        if (isHR) roles.push('Nhân sự');
        return `Bảng điều khiển ${roles.join(' - ')}`;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={getTitle()}
                description={`Xin chào, ${user?.name || 'Người dùng'}! Đây là tổng quan hệ thống của bạn.`}
                action={
                    isAdmin ? (
                        <Button onClick={handleSync} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Đồng bộ dữ liệu
                        </Button>
                    ) : undefined
                }
            />

            {/* ========== MONTH/YEAR SELECTOR ========== */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Thống kê theo thời gian:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value.toString()}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    {stats === null && !loading && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            Không có dữ liệu cho tháng {monthKey}. Hãy nhấn "Đồng bộ dữ liệu" để tạo.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* ========== ADMIN SECTION ========== */}
            {isAdmin && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-admin" />
                        <h2 className="text-lg font-semibold">Thống kê Quản trị</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Tổng người dùng"
                            value={loading ? '...' : totalUsers.toLocaleString()}
                            icon={Users}
                            variant="admin"
                        />
                        <StatCard
                            title="Phiên đang hoạt động"
                            value="--"
                            icon={Activity}
                            variant="admin"
                        />
                    </div>
                </section>
            )}

            {/* ========== MANAGER SECTION ========== */}
            {isManager && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-manager" />
                        <h2 className="text-lg font-semibold">Thống kê Quản lý</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <StatCard
                            title="Phòng ban"
                            value={loading ? '...' : totalDepartments.toLocaleString()}
                            icon={Building2}
                            variant="manager"
                        />
                        <StatCard
                            title="Mẫu lương đang dùng"
                            value={loading ? '...' : totalSalaryTemplates.toLocaleString()}
                            icon={FileText}
                            variant="manager"
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="w-4 h-4 text-manager" />
                                    Truy cập nhanh
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Link to="/manager/departments">
                                    <Button variant="outline" className="w-full">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Phòng ban
                                    </Button>
                                </Link>
                                <Link to="/manager/salary-templates">
                                    <Button variant="outline" className="w-full">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Mẫu lương
                                    </Button>
                                </Link>
                                <Link to="/manager/salary-periods">
                                    <Button variant="outline" className="w-full">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Kỳ lương
                                    </Button>
                                </Link>
                                <Link to="/manager/salary-results">
                                    <Button variant="outline" className="w-full">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Kết quả lương
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* ========== HR SECTION ========== */}
            {isHR && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-hr" />
                        <h2 className="text-lg font-semibold">Thống kê Nhân sự</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <StatCard
                            title="Tổng nhân viên"
                            value={loading ? '...' : totalEmployees.toLocaleString()}
                            icon={Users}
                            variant="hr"
                        />
                        <StatCard
                            title="Vị trí đang tuyển"
                            value={loading ? '...' : openPositions.toLocaleString()}
                            icon={UserPlus}
                            variant="hr"
                        />
                        <StatCard
                            title="Ca chấm công đủ"
                            value={loading ? '...' : completedAttendance.toLocaleString()}
                            icon={Clock}
                            variant="hr"
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <UserPlus className="w-4 h-4 text-hr" />
                                    Truy cập nhanh
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Link to="/hr/staff">
                                    <Button variant="outline" className="w-full">
                                        <Users className="w-4 h-4 mr-2" />
                                        Nhân viên
                                    </Button>
                                </Link>
                                <Link to="/hr/recruitment-requests">
                                    <Button variant="outline" className="w-full">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Tuyển dụng
                                    </Button>
                                </Link>
                                <Link to="/hr/timekeeping">
                                    <Button variant="outline" className="w-full">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Chấm công
                                    </Button>
                                </Link>
                                <Link to="/hr/candidates">
                                    <Button variant="outline" className="w-full">
                                        <Badge className="w-4 h-4 mr-2" />
                                        Ứng viên
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* Fallback nếu không có role nào khớp */}
            {!isAdmin && !isManager && !isHR && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">
                            Bạn không có quyền truy cập bảng điều khiển quản trị.
                            <br />
                            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
