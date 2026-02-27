import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_PERMISSIONS, ROLE_DEFAULT_PATHS } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine allowed roles - either from props or from ROLE_PERMISSIONS config
  const roles = allowedRoles || ROLE_PERMISSIONS[location.pathname];

  // If roles are defined, check if user has permission
  if (roles && roles.length > 0) {
    // Check if user has ANY of the allowed roles
    const hasPermission = roles.some(role => user.roles.includes(role));

    if (!hasPermission) {
      // Redirect to 403 page if user doesn't have permission
      return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}

// A simpler component that only requires authentication
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Redirect authenticated users away from auth pages
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const defaultPath = ROLE_DEFAULT_PATHS[user.roles[0]] || '/employee';
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
}
