export type UserRole = 'admin' | 'manager' | 'hr' | 'employee';

import { Staff } from './staff';
import { Person } from './person';

export interface User {
  id: string;
  staffId: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatar?: string;
  department?: string;
  staff?: Staff;
  person?: Person;
}

export interface AuthContextType {
  user: User | null;
  staff: Staff | null;
  person: Person | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshUserData?: () => Promise<void>;
}

// Route permissions configuration
export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
  '/manager': ['admin', 'manager'],
  '/manager/departments': ['admin', 'manager'],
  '/manager/salary-templates': ['admin', 'manager'],
  '/manager/salary-periods': ['admin', 'manager'],
  '/manager/salary-results': ['admin', 'manager'],
  '/manager/salary-result-items': ['admin', 'manager'],
  '/manager/salary-result-item-details': ['admin', 'manager'],
  '/hr': ['admin', 'hr'],

  '/hr/staff': ['admin', 'hr'],
  '/hr/shifts': ['admin', 'hr'],
  '/hr/timekeeping': ['admin', 'hr'],
  '/employee': ['admin', 'manager', 'hr', 'employee'],
  '/employee/schedule': ['admin', 'manager', 'hr', 'employee'],
  '/employee/profile': ['admin', 'manager', 'hr', 'employee'],
  '/employee/salary': ['admin', 'manager', 'hr', 'employee'],
};

// Default redirect paths by role after login
export const ROLE_DEFAULT_PATHS: Record<UserRole, string> = {
  admin: '/dashboard',
  manager: '/dashboard',
  hr: '/dashboard',
  employee: '/employee',
};
