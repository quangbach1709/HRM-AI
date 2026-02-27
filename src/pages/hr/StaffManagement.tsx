import { useState } from 'react';
import { Plus, Search, Filter, Eye, Pencil, FileText, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataCard } from '@/components/ui/data-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { StaffFormModal } from '@/components/modals/StaffFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface Staff {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  contractEnd: string;
  avatar: string;
}

const initialStaffList: Staff[] = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@congty.vn', department: 'Kỹ thuật', position: 'Lập trình viên cao cấp', status: 'active', contractEnd: 'Không thời hạn', avatar: 'NA' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@congty.vn', department: 'Kinh doanh', position: 'Trưởng phòng kinh doanh', status: 'active', contractEnd: 'Không thời hạn', avatar: 'TB' },
  { id: 3, name: 'Lê Minh Cường', email: 'cuong.le@congty.vn', department: 'Marketing', position: 'Chuyên viên Marketing', status: 'active', contractEnd: '12/2025', avatar: 'LC' },
  { id: 4, name: 'Phạm Thị Dung', email: 'dung.pham@congty.vn', department: 'Kỹ thuật', position: 'Trưởng nhóm kỹ thuật', status: 'on-leave', contractEnd: 'Không thời hạn', avatar: 'PD' },
  { id: 5, name: 'Hoàng Văn Em', email: 'em.hoang@congty.vn', department: 'Vận hành', position: 'Phân tích vận hành', status: 'active', contractEnd: '03/2025', avatar: 'HE' },
];

const departmentColors: Record<string, string> = {
  'Kỹ thuật': 'bg-primary/10 text-primary',
  'Kinh doanh': 'bg-manager/10 text-manager',
  'Marketing': 'bg-hr/10 text-hr',
  'Vận hành': 'bg-employee/10 text-employee',
};

const statusLabels: Record<string, string> = {
  'active': 'Đang làm',
  'on-leave': 'Nghỉ phép',
};

export default function StaffManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [staffList, setStaffList] = useState<Staff[]>(initialStaffList);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && staff.status === 'active') ||
      (activeTab === 'on-leave' && staff.status === 'on-leave');
    return matchesSearch && matchesTab;
  });

  const pagination = usePagination(filteredStaff, { initialPageSize: 10 });

  const handleOpenCreateModal = () => {
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const handleView = (staff: Staff) => {
    setViewingStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: selectedStaff ? "Cập nhật thành công" : "Thêm mới thành công",
      description: `Thông tin nhân viên đã được ${selectedStaff ? 'cập nhật' : 'thêm mới'}.`,
    });
    setIsFormModalOpen(false);
    setSelectedStaff(null);
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStaffList((prev) => prev.filter((staff) => staff.id !== selectedStaff.id));
    
    toast({
      title: "Xóa thành công",
      description: `Nhân viên "${selectedStaff.name}" đã được xóa khỏi hệ thống.`,
      variant: "destructive",
    });

    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý nhân viên"
        description="Quản lý hồ sơ nhân viên và hợp đồng"
        action={
          <Button className="touch-target" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        }
      />

      {/* Tabs and Search */}
      <div className="space-y-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang làm</TabsTrigger>
            <TabsTrigger value="on-leave">Nghỉ phép</TabsTrigger>
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
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px] text-center sticky left-0 bg-background z-10">Hành động</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Hợp đồng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="sticky left-0 bg-background z-10">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleView(staff)}
                        aria-label="Xem"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                        onClick={() => handleOpenEditModal(staff)}
                        aria-label="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        onClick={() => handleOpenDeleteDialog(staff)}
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-hr/10 text-hr">
                          {staff.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={departmentColors[staff.department] || 'bg-muted text-muted-foreground'}>
                      {staff.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{staff.contractEnd}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={staff.status === 'active' ? 'status-success' : 'status-warning'}
                    >
                      {statusLabels[staff.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls {...pagination} />
        </CardContent>
      </Card>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pagination.paginatedData.map((staff) => (
            <DataCard
              key={staff.id}
              title={staff.name}
              subtitle={staff.position}
              avatar={staff.avatar}
              avatarColor="bg-hr/10 text-hr"
              status={{
                label: statusLabels[staff.status],
                variant: staff.status === 'active' ? 'success' : 'warning',
              }}
              meta={
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={departmentColors[staff.department] || 'bg-muted text-muted-foreground'}>
                    {staff.department}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{staff.contractEnd}</span>
                </div>
              }
              onClick={() => handleOpenEditModal(staff)}
            />
          ))}
        </div>
        <Card>
          <PaginationControls {...pagination} />
        </Card>
      </div>

      {/* View Modal */}
      <StaffFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSuccess={() => {}}
        editData={null}
        mode="view"
      />

      {/* Form Modal */}
      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode={selectedStaff ? 'edit' : 'create'}
        editData={null}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa nhân viên"
        description={`Bạn có chắc chắn muốn xóa nhân viên "${selectedStaff?.name}"? Tất cả dữ liệu liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}