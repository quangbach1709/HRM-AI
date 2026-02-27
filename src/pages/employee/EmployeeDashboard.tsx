import { useState } from 'react';
import { Clock, Calendar, DollarSign, User, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleAttendance = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      toast.success('Đã chấm công ra!', { description: `Giờ ra: ${new Date().toLocaleTimeString('vi-VN')}` });
    } else {
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString('vi-VN'));
      toast.success('Đã chấm công vào!', { description: `Giờ vào: ${new Date().toLocaleTimeString('vi-VN')}` });
    }
  };

  const quickLinks = [
    { title: 'Hồ sơ cá nhân', icon: User, href: '/employee/profile', color: 'bg-hr/10 text-hr' },
    { title: 'Bảng lương', icon: DollarSign, href: '/employee/salary', color: 'bg-employee/10 text-employee' },
  ];

  const upcomingShifts = [
    { date: 'Hôm nay', shift: 'Sáng', time: '6:00 - 14:00' },
    { date: 'Ngày mai', shift: 'Chiều', time: '14:00 - 22:00' },
    { date: 'T4, 25/12', shift: 'Nghỉ', time: '-' },
  ];

  return (
    <div>
      <PageHeader title={`Xin chào, ${user?.name?.split(' ').pop() || 'Nhân viên'}!`} description="Chào mừng bạn đến với hệ thống" />

      <Card className="mb-6 overflow-hidden">
        <div className={`p-6 ${isCheckedIn ? 'bg-gradient-to-r from-success/20 to-success/5' : 'bg-gradient-to-r from-primary/20 to-primary/5'}`}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isCheckedIn ? 'bg-success/20' : 'bg-primary/20'}`}>
              <Clock className={`w-8 h-8 ${isCheckedIn ? 'text-success' : 'text-primary'}`} />
            </div>
            <h2 className="text-xl font-bold mb-1">{isCheckedIn ? 'Bạn đã chấm công vào' : 'Sẵn sàng làm việc?'}</h2>
            {isCheckedIn && checkInTime && <p className="text-sm text-muted-foreground mb-4">Từ {checkInTime}</p>}
            <Button size="lg" className={`w-full max-w-xs h-14 text-lg font-semibold ${isCheckedIn ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`} onClick={handleAttendance}>
              {isCheckedIn ? (<><LogOut className="w-5 h-5 mr-2" />Chấm công ra</>) : (<><LogIn className="w-5 h-5 mr-2" />Chấm công vào</>)}
            </Button>
            {isCheckedIn && <div className="flex items-center gap-2 mt-4 text-success"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">Đã ghi nhận chấm công</span></div>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickLinks.map((link) => {
          const Icon = link.icon; return (
            <Link key={link.title} to={link.href}><Card className="card-interactive h-full"><CardContent className="p-4 flex flex-col items-center text-center"><div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-2`}><Icon className="w-6 h-6" /></div><span className="text-sm font-medium">{link.title}</span></CardContent></Card></Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="w-5 h-5 text-employee" />Ca làm sắp tới</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingShifts.map((shift, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${shift.shift === 'Nghỉ' ? 'bg-muted' : 'bg-secondary/50'}`}>
                <div><p className="font-medium">{shift.date}</p><p className="text-sm text-muted-foreground">{shift.time}</p></div>
                <Badge variant={shift.shift === 'Nghỉ' ? 'secondary' : 'default'} className={shift.shift === 'Sáng' ? 'bg-info/20 text-info' : shift.shift === 'Chiều' ? 'bg-warning/20 text-warning' : ''}>{shift.shift}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
