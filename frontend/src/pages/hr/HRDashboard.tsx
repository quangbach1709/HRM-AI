import { UserPlus, Users, Calendar, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const recentCandidates = [
  { id: 1, name: 'Nguyễn Thị Lan', position: 'Lập trình viên Frontend', stage: 'Phỏng vấn', avatar: 'NL' },
  { id: 2, name: 'Trần Văn Minh', position: 'Quản lý sản phẩm', stage: 'Ứng tuyển', avatar: 'TM' },
  { id: 3, name: 'Lê Hoàng Nam', position: 'Thiết kế UX', stage: 'Đã tuyển', avatar: 'LN' },
];

const upcomingShifts = [
  { shift: 'Sáng', time: '6:00 - 14:00', employees: 45 },
  { shift: 'Chiều', time: '14:00 - 22:00', employees: 52 },
  { shift: 'Đêm', time: '22:00 - 6:00', employees: 28 },
];

export default function HRDashboard() {
  const { stats, loading } = useDashboardStats();

  // Lấy dữ liệu từ MongoDB hoặc hiển thị 0 nếu chưa có
  const totalEmployees = stats?.hr_stats?.total_employees ?? 0;
  const openPositions = stats?.hr_stats?.open_positions ?? 0;
  const completedAttendance = stats?.hr_stats?.completed_attendance ?? 0;

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển Nhân sự"
        description="Quản lý vận hành và nhân sự"
      />

      {/* Stats Grid - Chỉ hiển thị HR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-hr" />Ứng viên gần đây</CardTitle>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-hr/10 text-hr">{candidate.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{candidate.position}</p>
                  </div>
                  <Badge variant="secondary" className={candidate.stage === 'Đã tuyển' ? 'status-success' : candidate.stage === 'Phỏng vấn' ? 'status-warning' : ''}>{candidate.stage}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-hr" />Thống kê chấm công</CardTitle>
            <Link to="/hr/timekeeping"><Button variant="outline" size="sm">Chi tiết</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-hr">{loading ? '...' : completedAttendance}</p>
              <p className="text-muted-foreground mt-2">Ca làm việc đã hoàn thành</p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng nhân viên</span>
                <span className="font-bold">{loading ? '...' : totalEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-hr" />Ca làm hôm nay</CardTitle>
            <Link to="/hr/shifts"><Button variant="outline" size="sm">Quản lý</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingShifts.map((shift) => (
                <div key={shift.shift} className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-1"><span className="font-medium">Ca {shift.shift}</span><Badge variant="secondary">{shift.employees} người</Badge></div>
                  <p className="text-sm text-muted-foreground">{shift.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
