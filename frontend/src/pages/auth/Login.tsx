import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ROLE_DEFAULT_PATHS } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to their dashboard
  if (!authLoading && isAuthenticated && user) {
    const defaultPath = ROLE_DEFAULT_PATHS[user.roles?.[0] || 'employee'];
    navigate(defaultPath, { replace: true });
    return null;
  }

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await login(data.email, data.password);
      
      if (error) {
        toast({
          title: 'Đăng nhập thất bại',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn trở lại!',
      });

      // Force a refresh to update auth context
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-border/50 backdrop-blur-sm animate-fade-in">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Hệ thống HRM
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Đăng nhập để quản lý nhân sự
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="email@company.com"
                          className="pl-10 h-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Ghi nhớ đăng nhập
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-primary"
                >
                  Quên mật khẩu?
                </Button>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          {/* Demo Accounts */}
          <div className="w-full pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Tài khoản demo (mật khẩu: <code className="text-xs bg-muted px-1 py-0.5 rounded">123456</code>)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-admin/10 text-center cursor-pointer hover:bg-admin/20 transition-colors"
                onClick={() => {
                  form.setValue('email', 'admin@company.com');
                  form.setValue('password', '123456');
                }}>
                <p className="font-medium text-admin">Admin</p>
                <p className="text-muted-foreground truncate">admin@company.com</p>
              </div>
              <div className="p-2 rounded-lg bg-manager/10 text-center cursor-pointer hover:bg-manager/20 transition-colors"
                onClick={() => {
                  form.setValue('email', 'manager@company.com');
                  form.setValue('password', '12345678');
                }}>
                <p className="font-medium text-manager">Manager</p>
                <p className="text-muted-foreground truncate">manager@company.com</p>
              </div>
              <div className="p-2 rounded-lg bg-hr/10 text-center cursor-pointer hover:bg-hr/20 transition-colors"
                onClick={() => {
                  form.setValue('email', 'hr@company.com');
                  form.setValue('password', '123456');
                }}>
                <p className="font-medium text-hr">HR</p>
                <p className="text-muted-foreground truncate">hr@company.com</p>
              </div>
              <div className="p-2 rounded-lg bg-employee/10 text-center cursor-pointer hover:bg-employee/20 transition-colors"
                onClick={() => {
                  form.setValue('email', 'employee@company.com');
                  form.setValue('password', '123456');
                }}>
                <p className="font-medium text-employee">Employee</p>
                <p className="text-muted-foreground truncate">employee@company.com</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Footer */}
      <p className="absolute bottom-4 text-center text-xs text-muted-foreground">
        © 2025 HRM System. Bản quyền thuộc về công ty.
      </p>
    </div>
  );
}
