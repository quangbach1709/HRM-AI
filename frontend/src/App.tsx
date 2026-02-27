// HRM Application
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
import { ROLE_DEFAULT_PATHS } from "@/types/auth";

// Auth Pages
import Login from "@/pages/auth/Login";
import Forbidden from "@/pages/auth/Forbidden";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UnifiedDashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import RoleManagement from "@/pages/admin/RoleManagement";
import UserRoleManagement from "@/pages/admin/UserRoleManagement";
import SystemConfigManagement from "@/pages/admin/SystemConfigManagement";

// Manager Pages
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import DepartmentManagement from "@/pages/manager/DepartmentManagement";
import PositionManagement from "@/pages/manager/PositionManagement";
import { SalaryTemplateManagement as SalaryTemplates } from "@/pages/manager/SalaryTemplateManagement";
import { SalaryPeriodManagement as SalaryPeriods } from "@/pages/manager/SalaryPeriodManagement";
import SalaryTemplateItemManagement from "@/pages/manager/SalaryTemplateItemManagement";
import SalaryResultManagement from "@/pages/manager/SalaryResultManagement";
import SalaryResultItemManagement from "@/pages/manager/SalaryResultItemManagement";
import SalaryResultItemDetailManagement from "@/pages/manager/SalaryResultItemDetailManagement";

// HR Pages
import HRDashboard from "@/pages/hr/HRDashboard";

import StaffManagement from "@/pages/manager/StaffManagement";
import StaffWorkScheduleManagement from "@/pages/hr/StaffWorkScheduleManagement";
import Timekeeping from "@/pages/hr/Timekeeping";
import PersonManagement from "@/pages/manager/PersonManagement";
import CertificateManagement from "@/pages/hr/CertificateManagement";
import RecruitmentRequestManagement from "@/pages/hr/RecruitmentRequestManagement";
import LabourAgreementManagement from "@/pages/hr/LabourAgreementManagement";
import CandidateManagement from "@/pages/hr/CandidateManagement";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import MyProfile from "@/pages/employee/MyProfile";
import MySalary from "@/pages/employee/MySalary";
import MyAttendance from "@/pages/employee/MyAttendance";
import FaceRegistration from "@/pages/employee/FaceRegistration";

// HR Face Approval
import FaceApproval from "@/pages/hr/FaceApproval";

// Public Pages
import CandidateApplyPage from "@/pages/public/CandidateApplyPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DEFAULT_PATHS[user.roles[0]]} replace />;
}

function ProtectedPage({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Array<'admin' | 'manager' | 'hr' | 'employee'> }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/apply" element={<CandidateApplyPage />} />

            {/* Unified Dashboard - accessible by admin, manager, hr */}
            <Route path="/dashboard" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr']}><UnifiedDashboard /></ProtectedPage>} />

            {/* Admin Routes - redirect /admin to /dashboard */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin/users" element={<ProtectedPage allowedRoles={['admin']}><UserManagement /></ProtectedPage>} />
            <Route path="/admin/roles" element={<ProtectedPage allowedRoles={['admin']}><RoleManagement /></ProtectedPage>} />
            <Route path="/admin/user-roles" element={<ProtectedPage allowedRoles={['admin']}><UserRoleManagement /></ProtectedPage>} />
            <Route path="/admin/system-configs" element={<ProtectedPage allowedRoles={['admin']}><SystemConfigManagement /></ProtectedPage>} />

            {/* Manager Routes - redirect /manager to /dashboard */}
            <Route path="/manager" element={<Navigate to="/dashboard" replace />} />
            <Route path="/manager/departments" element={<ProtectedPage allowedRoles={['admin', 'manager']}><DepartmentManagement /></ProtectedPage>} />
            <Route path="/manager/positions" element={<ProtectedPage allowedRoles={['admin', 'manager']}><PositionManagement /></ProtectedPage>} />
            <Route path="/manager/salary-templates" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryTemplates /></ProtectedPage>} />
            <Route path="/manager/salary-template-items" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryTemplateItemManagement /></ProtectedPage>} />
            <Route path="/manager/salary-periods" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryPeriods /></ProtectedPage>} />
            <Route path="/manager/salary-results" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryResultManagement /></ProtectedPage>} />
            <Route path="/manager/salary-result-items" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryResultItemManagement /></ProtectedPage>} />
            <Route path="/manager/salary-result-item-details" element={<ProtectedPage allowedRoles={['admin', 'manager']}><SalaryResultItemDetailManagement /></ProtectedPage>} />

            {/* HR Routes - redirect /hr to /dashboard */}
            <Route path="/hr" element={<Navigate to="/dashboard" replace />} />

            <Route path="/hr/recruitment-requests" element={<ProtectedPage allowedRoles={['admin', 'hr']}><RecruitmentRequestManagement /></ProtectedPage>} />
            <Route path="/hr/candidates" element={<ProtectedPage allowedRoles={['admin', 'hr']}><CandidateManagement /></ProtectedPage>} />
            <Route path="/hr/staff" element={<ProtectedPage allowedRoles={['admin', 'hr']}><StaffManagement /></ProtectedPage>} />
            <Route path="/hr/persons" element={<ProtectedPage allowedRoles={['admin', 'hr']}><PersonManagement /></ProtectedPage>} />
            <Route path="/hr/certificates" element={<ProtectedPage allowedRoles={['admin', 'hr']}><CertificateManagement /></ProtectedPage>} />
            <Route path="/hr/labour-agreements" element={<ProtectedPage allowedRoles={['admin', 'hr']}><LabourAgreementManagement /></ProtectedPage>} />
            <Route path="/hr/shifts" element={<ProtectedPage allowedRoles={['admin', 'hr']}><StaffWorkScheduleManagement /></ProtectedPage>} />
            <Route path="/hr/timekeeping" element={<ProtectedPage allowedRoles={['admin', 'hr']}><Timekeeping /></ProtectedPage>} />
            <Route path="/hr/face-approval" element={<ProtectedPage allowedRoles={['admin', 'hr']}><FaceApproval /></ProtectedPage>} />

            {/* Employee Routes */}
            <Route path="/employee" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr', 'employee']}><EmployeeDashboard /></ProtectedPage>} />
            <Route path="/employee/profile" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr', 'employee']}><MyProfile /></ProtectedPage>} />
            <Route path="/employee/salary" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr', 'employee']}><MySalary /></ProtectedPage>} />
            <Route path="/employee/attendance" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr', 'employee']}><MyAttendance /></ProtectedPage>} />
            <Route path="/employee/face-registration" element={<ProtectedPage allowedRoles={['admin', 'manager', 'hr', 'employee']}><FaceRegistration /></ProtectedPage>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
