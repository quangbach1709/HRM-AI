import { Building2, FileText, Calendar, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const upcomingPayrolls = [
  { period: 'Tháng 12/2024', status: 'Đang xử lý', amount: '4.900.000.000 ₫', dueDate: '25/12' },
  { period: 'Tháng 01/2025', status: 'Chờ xử lý', amount: '4.970.000.000 ₫', dueDate: '25/01' },
];

export default function ManagerDashboard() {
  const { stats, loading } = useDashboardStats();

  // Lấy dữ liệu từ MongoDB hoặc hiển thị 0 nếu chưa có
  const totalDepartments = stats?.manager_stats?.total_departments ?? 0;
  const totalSalaryTemplates = stats?.manager_stats?.total_salary_templates ?? 0;

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển Quản lý"
        description="Quản lý cơ cấu tổ chức và lương thưởng"
      />

      {/* Stats Grid - Chỉ hiển thị Manager Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-manager" />
              Tổng quan phòng ban
            </CardTitle>
            <Link to="/manager/departments">
              <Button variant="outline" size="sm">Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-manager">{loading ? '...' : totalDepartments}</p>
              <p className="text-muted-foreground mt-2">Phòng ban đang hoạt động</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payrolls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-manager" />
              Kỳ lương sắp tới
            </CardTitle>
            <Link to="/manager/salary-periods">
              <Button variant="outline" size="sm">Quản lý</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayrolls.map((payroll) => (
                <div
                  key={payroll.period}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{payroll.period}</p>
                    <p className="text-sm text-muted-foreground">Hạn: {payroll.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{payroll.amount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${payroll.status === 'Đang xử lý'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {payroll.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/manager/salary-templates">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Mẫu lương
                </Button>
              </Link>
              <Link to="/manager/salary-results">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Kết quả lương
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
