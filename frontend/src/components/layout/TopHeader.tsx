import { Bell, Search, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const roleColors = {
  admin: 'bg-admin text-admin-foreground',
  manager: 'bg-manager text-manager-foreground',
  hr: 'bg-hr text-hr-foreground',
  employee: 'bg-employee text-employee-foreground',
};

const roleLabels = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  hr: 'Nhân sự',
  employee: 'Nhân viên',
};

export function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="touch-target" />
          
          {/* Search - hidden on mobile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-64 pl-9 bg-secondary border-0"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative touch-target">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="touch-target flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={roleColors[user?.roles?.[0] || 'employee']}>
                    {user?.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {roleLabels[user?.roles?.[0] || 'employee']}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/employee/profile')}>
                <User className="w-4 h-4 mr-2" />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt tài khoản
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Trợ giúp & Hỗ trợ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
