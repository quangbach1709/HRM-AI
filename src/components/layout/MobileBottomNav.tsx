import { Home, Calendar, User, DollarSign, Users, Clock, Building2, Shield } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';

const roleNavItems = {
  admin: [
    { title: 'Trang chủ', url: '/admin', icon: Home },
    { title: 'Tài khoản', url: '/admin/users', icon: Shield },
  ],
  manager: [
    { title: 'Trang chủ', url: '/manager', icon: Home },
    { title: 'Phòng ban', url: '/manager/departments', icon: Building2 },
    { title: 'Lương', url: '/manager/salary-results', icon: DollarSign },
  ],
  hr: [
    { title: 'Trang chủ', url: '/hr', icon: Home },
    { title: 'Nhân viên', url: '/hr/staff', icon: Users },
    { title: 'Chấm công', url: '/hr/timekeeping', icon: Clock },
  ],
  employee: [
    { title: 'Trang chủ', url: '/employee', icon: Home },
    { title: 'Chấm công', url: '/employee/attendance', icon: Clock },
    { title: 'Hồ sơ', url: '/employee/profile', icon: User },
    { title: 'Lương', url: '/employee/salary', icon: DollarSign },
  ],
};

export function MobileBottomNav() {
  const { user } = useAuth();

  if (!user) return null;

  if (!user) return null;

  // Merge nav items from all user roles for mobile
  // Since mobile nav is simple, we might just want to show unique items
  const mergedNavItems: any[] = [];
  const seenTitles = new Set<string>();
  const orderedRoles = ['admin', 'manager', 'hr', 'employee'];

  orderedRoles.forEach(role => {
    if (user.roles.includes(role as any)) {
      const items = roleNavItems[role as keyof typeof roleNavItems];
      items?.forEach(item => {
        if (!seenTitles.has(item.title)) {
          mergedNavItems.push(item);
          seenTitles.add(item.title);
        }
      });
    }
  });

  // Limit items for mobile to avoid overcrowding? 
  // For now, let's just display them. If too many, user can scroll or we'll deal with UI later.
  // The original UI used `justify-around`, so too many items might break layout.
  // I'll stick to a max of 5 or just let it render. The user asked for "ALL screens".
  const navItems = mergedNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-muted-foreground transition-colors touch-target min-w-[64px]"
            activeClassName="text-primary bg-primary/5"
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
