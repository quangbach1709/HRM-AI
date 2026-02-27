import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth, useDefaultPath } from '@/contexts/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const defaultPath = useDefaultPath();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(defaultPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">403</h1>
          <h2 className="text-xl font-semibold text-foreground">Truy cập bị từ chối</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        {/* User Info */}
        {user && (
          <div className="p-4 rounded-lg bg-muted/50 text-sm">
            <p className="text-muted-foreground">
              Đăng nhập với: <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <p className="text-muted-foreground">
              Vai trò: <span className="font-medium text-foreground capitalize">{user.roles?.join(', ')}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
