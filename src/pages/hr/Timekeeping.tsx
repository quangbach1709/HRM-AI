import { useState } from 'react';
import { Search, Filter, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimekeepingFormModal, TimekeepingFormData } from '@/components/modals/TimekeepingFormModal';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface TimekeepingRecord {
  id: number;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  avatar: string;
}

const initialTimekeepingData: TimekeepingRecord[] = [
  { id: 1, name: 'Nguyễn Văn An', date: '20/12', checkIn: '8:02', checkOut: '17:15', status: 'present', hours: '9g 13p', avatar: 'NA' },
  { id: 2, name: 'Trần Thị Bình', date: '20/12', checkIn: '8:45', checkOut: '17:30', status: 'late', hours: '8g 45p', avatar: 'TB' },
  { id: 3, name: 'Lê Minh Cường', date: '20/12', checkIn: '-', checkOut: '-', status: 'absent', hours: '-', avatar: 'LC' },
  { id: 4, name: 'Phạm Thị Dung', date: '20/12', checkIn: '7:55', checkOut: '17:00', status: 'present', hours: '9g 5p', avatar: 'PD' },
  { id: 5, name: 'Hoàng Văn Em', date: '20/12', checkIn: '9:15', checkOut: '-', status: 'late', hours: 'Đang làm', avatar: 'HE' },
];

const summaryStats = [
  { label: 'Có mặt', count: 142, icon: CheckCircle, color: 'text-success' },
  { label: 'Đi muộn', count: 8, icon: Clock, color: 'text-warning' },
  { label: 'Vắng mặt', count: 6, icon: XCircle, color: 'text-destructive' },
];

const statusConfig = {
  present: { label: 'Có mặt', className: 'status-success' },
  late: { label: 'Đi muộn', className: 'status-warning' },
  absent: { label: 'Vắng mặt', className: 'status-destructive' },
  leave: { label: 'Nghỉ phép', className: 'status-info' },
};

export default function Timekeeping() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [timekeepingData, setTimekeepingData] = useState(initialTimekeepingData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimekeepingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredData = timekeepingData.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pagination = usePagination(filteredData, { initialPageSize: 10 });

  const handleEdit = (record: TimekeepingRecord) => {
    setSelectedRecord(record);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: TimekeepingFormData) => {
    if (!selectedRecord) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTimekeepingData((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? {
                ...r,
                checkIn: data.checkIn || '-',
                checkOut: data.checkOut || '-',
                status: data.status,
                hours: calculateHours(data.checkIn, data.checkOut),
              }
            : r
        )
      );

      toast({ title: 'Cập nhật thành công', description: `Đã cập nhật chấm công cho ${selectedRecord.name}` });
      setIsFormModalOpen(false);
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra, vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHours = (checkIn?: string, checkOut?: string): string => {
    if (!checkIn || !checkOut) return '-';
    
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    const diffMinutes = outMinutes - inMinutes;
    
    if (diffMinutes <= 0) return '-';
    
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    return `${hours}g ${mins}p`;
  };

  return (
    <div>
      <PageHeader
        title="Chấm công"
        description="Theo dõi và quản lý chấm công nhân viên"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs and Search */}
      <div className="space-y-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="week">Tuần này</TabsTrigger>
            <TabsTrigger value="month">Tháng này</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ vào</TableHead>
                <TableHead>Giờ ra</TableHead>
                <TableHead>Số giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((record) => {
                const status = statusConfig[record.status as keyof typeof statusConfig];
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-hr/10 text-hr">
                            {record.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{record.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>{record.hours}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls {...pagination} />
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {pagination.paginatedData.map((record) => {
          const status = statusConfig[record.status as keyof typeof statusConfig];
          return (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-hr/10 text-hr">
                        {record.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{record.name}</p>
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Giờ vào</p>
                    <p className="font-medium">{record.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Giờ ra</p>
                    <p className="font-medium">{record.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số giờ</p>
                    <p className="font-medium">{record.hours}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => handleEdit(record)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <PaginationControls {...pagination} />
        </Card>
      </div>

      <TimekeepingFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        record={selectedRecord}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
