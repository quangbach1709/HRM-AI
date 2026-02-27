import { useState } from 'react';
import {
  Home, Users, Building2, DollarSign, UserPlus, Calendar, Clock, FileText, Settings, Shield, MapPin, Award, FileSignature, Receipt, Calculator, User, UserCog, ChevronDown, ScanFace, Wrench
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

type NavConfig = (NavItem | NavGroup)[];

const roleNavItems: Record<string, NavConfig> = {
  admin: [
    { title: 'Trang chủ', url: '/admin', icon: Home },
    {
      title: 'Quản lý hệ thống',
      icon: Settings,
      items: [
        { title: 'Tài khoản', url: '/admin/users', icon: Users },
        { title: 'Vai trò', url: '/admin/roles', icon: Shield },
        { title: 'Phân quyền', url: '/admin/user-roles', icon: UserCog },
        { title: 'Cấu hình hệ thống', url: '/admin/system-configs', icon: Wrench },
      ],
    },
  ],
  manager: [
    { title: 'Trang chủ', url: '/manager', icon: Home },
    {
      title: 'Tổ chức',
      icon: Building2,
      items: [
        { title: 'Phòng ban', url: '/manager/departments', icon: Building2 },
        { title: 'Vị trí', url: '/manager/positions', icon: MapPin },
      ],
    },
    {
      title: 'Tiền lương',
      icon: DollarSign,
      items: [
        { title: 'Mẫu lương', url: '/manager/salary-templates', icon: FileText },
        { title: 'Thành phần lương', url: '/manager/salary-template-items', icon: Calculator },
        { title: 'Kỳ lương', url: '/manager/salary-periods', icon: Calendar },
        { title: 'Bảng lương', url: '/manager/salary-results', icon: Receipt },
        { title: 'Bảng lương nhân viên', url: '/manager/salary-result-items', icon: Users },
        { title: 'Chi tiết khoản lương', url: '/manager/salary-result-item-details', icon: Calculator },
      ],
    },
  ],
  hr: [
    { title: 'Trang chủ', url: '/hr', icon: Home },
    {
      title: 'Tuyển dụng',
      icon: UserPlus,
      items: [

        { title: 'Yêu cầu tuyển dụng', url: '/hr/recruitment-requests', icon: FileText },
        { title: 'Danh sách ứng viên', url: '/hr/candidates', icon: Users },
      ],
    },
    {
      title: 'Nhân sự',
      icon: Users,
      items: [
        { title: 'Quản lý nhân viên', url: '/hr/staff', icon: Users },
        { title: 'Thông tin cá nhân', url: '/hr/persons', icon: User },
        { title: 'Chứng chỉ', url: '/hr/certificates', icon: Award },
        { title: 'Hợp đồng lao động', url: '/hr/labour-agreements', icon: FileSignature },
      ],
    },
    {
      title: 'Chấm công',
      icon: Clock,
      items: [
        { title: 'Ca làm việc', url: '/hr/shifts', icon: Calendar },
        { title: 'Bảng chấm công', url: '/hr/timekeeping', icon: Clock },
        { title: 'Duyệt khuôn mặt', url: '/hr/face-approval', icon: ScanFace },
      ],
    },
  ],
  employee: [
    { title: 'Trang chủ', url: '/employee', icon: Home },
    { title: 'Chấm công', url: '/employee/attendance', icon: Clock },
    { title: 'Hồ sơ cá nhân', url: '/employee/profile', icon: Users },
    { title: 'Bảng lương', url: '/employee/salary', icon: DollarSign },
    { title: 'Đăng ký khuôn mặt', url: '/employee/face-registration', icon: ScanFace },
  ],
};

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

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item;
}

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  if (!user) return null;

  // Re-sort or organize. Iterate known roles order to merge menus.
  const orderedRoles = ['admin', 'manager', 'hr', 'employee'];
  const mergedNavItems: NavConfig = [];
  const seenTitles = new Set<string>();

  orderedRoles.forEach(role => {
    if (user.roles.includes(role as any)) {
      const items = roleNavItems[role];
      items?.forEach(item => {
        if (!seenTitles.has(item.title)) {
          mergedNavItems.push(item);
          seenTitles.add(item.title);
        }
      });
    }
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground">Hệ thống HRM</span>
              <span className="text-xs text-muted-foreground">v1.0</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            {!collapsed && 'Điều hướng'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mergedNavItems.map((item) => {
                if (isNavGroup(item)) {
                  const isOpen = openGroups[item.title] ?? true;
                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
                            tooltip={item.title}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && (
                              <ChevronDown
                                className={cn(
                                  'w-4 h-4 transition-transform',
                                  isOpen && 'rotate-180'
                                )}
                              />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                            {item.items.map((subItem) => (
                              <SidebarMenuButton key={subItem.url} asChild tooltip={subItem.title}>
                                <NavLink
                                  to={subItem.url}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                >
                                  <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                  {!collapsed && <span>{subItem.title}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors touch-target"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className={roleColors[user.roles[0]]}>
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm text-sidebar-foreground truncate">
                {user.name}
              </span>
              <Badge variant="secondary" className="w-fit text-xs mt-0.5">
                {roleLabels[user.roles[0]]}
                {user.roles.length > 1 && ` +${user.roles.length - 1}`}
              </Badge>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
