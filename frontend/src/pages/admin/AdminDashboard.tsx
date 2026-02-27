import { Shield, Users, Activity, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const recentActivity = [
  { id: 1, action: 'Tạo tài khoản', user: 'Nguyễn Văn An', time: '2 phút trước', type: 'success' },
  { id: 2, action: 'Đặt lại mật khẩu', user: 'Trần Thị Bình', time: '15 phút trước', type: 'warning' },
  { id: 3, action: 'Thay đổi vai trò', user: 'Lê Minh Cường', time: '1 giờ trước', type: 'info' },
  { id: 4, action: 'Khóa tài khoản', user: 'Phạm Thị Dung', time: '2 giờ trước', type: 'destructive' },
];

const systemHealth = [
  { name: 'Cơ sở dữ liệu', status: 'healthy' },
  { name: 'Máy chủ API', status: 'healthy' },
  { name: 'Xác thực', status: 'healthy' },
  { name: 'Lưu trữ file', status: 'warning' },
];

const statusLabels = {
  healthy: 'Bình thường',
  warning: 'Cảnh báo',
};

export default function AdminDashboard() {
  const { stats, loading, syncStats } = useDashboardStats();

  const handleSync = async () => {
    try {
      await syncStats();
      alert('Đồng bộ dữ liệu thành công!');
    } catch {
      alert('Lỗi khi đồng bộ dữ liệu');
    }
  };

  // Lấy dữ liệu từ MongoDB hoặc hiển thị 0 nếu chưa có
  const totalUsers = stats?.admin_stats?.total_users ?? 0;

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển Quản trị"
        description="Quản trị hệ thống và quản lý người dùng"
        action={
          <Button className="touch-target" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Đồng bộ dữ liệu
          </Button>
        }
      />

      {/* Stats Grid - Chỉ hiển thị Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-admin" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium text-sm">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={item.type === 'destructive' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.type === 'success' ? 'Thành công' :
                        item.type === 'warning' ? 'Cảnh báo' :
                          item.type === 'info' ? 'Thông tin' : 'Lỗi'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-admin" />
              Tình trạng hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${service.status === 'healthy' ? 'bg-success' : 'bg-warning'
                        }`}
                    />
                    <span className="text-sm">
                      {statusLabels[service.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Xem báo cáo chi tiết
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
