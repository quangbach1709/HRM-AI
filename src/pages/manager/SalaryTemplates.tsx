import { useState } from 'react';
import { Plus, Edit, Copy, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalaryTemplateFormModal } from '@/components/modals/SalaryTemplateFormModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { SalaryTemplateFormData } from '@/types/salaryTemplate';

interface SalaryTemplate {
  id: number;
  code: string;
  name: string;
  description: string;
  formula: string;
  usedBy: number;
  status: string;
}

const initialTemplates: SalaryTemplate[] = [
  {
    id: 1,
    code: 'SAL001',
    name: 'Nhân viên chuẩn',
    description: 'Lương cơ bản + thưởng chuyên cần',
    formula: 'Cơ bản + (Chuyên cần × 50.000) + Phụ cấp',
    usedBy: 45,
    status: 'active',
  },
  {
    id: 2,
    code: 'SAL002',
    name: 'Hoa hồng bán hàng',
    description: 'Lương cơ bản + hoa hồng doanh số',
    formula: 'Cơ bản + (Doanh số × 5%) + Phụ cấp',
    usedBy: 28,
    status: 'active',
  },
  {
    id: 3,
    code: 'SAL003',
    name: 'Gói quản lý',
    description: 'Lương cố định với thưởng',
    formula: 'Cố định + Thưởng hiệu suất + Phúc lợi',
    usedBy: 12,
    status: 'active',
  },
  {
    id: 4,
    code: 'SAL004',
    name: 'Thực tập sinh',
    description: 'Tính theo ngày công',
    formula: 'Lương ngày × Số ngày làm việc',
    usedBy: 8,
    status: 'draft',
  },
];

const statusLabels: Record<string, string> = {
  active: 'Đang dùng',
  draft: 'Bản nháp',
};

export default function SalaryTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = usePagination(templates, { initialPageSize: 10 });

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (template: SalaryTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleDuplicate = (template: SalaryTemplate) => {
    const newTemplate: SalaryTemplate = {
      ...template,
      id: Date.now(),
      code: `${template.code}_COPY`,
      name: `${template.name} (Bản sao)`,
      usedBy: 0,
      status: 'draft',
    };
    setTemplates((prev) => [...prev, newTemplate]);
    toast({ title: 'Sao chép thành công', description: `Đã tạo bản sao của "${template.name}"` });
  };

  const handleDeleteClick = (template: SalaryTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: SalaryTemplateFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      if (selectedTemplate) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === selectedTemplate.id
              ? { ...t, code: data.code, name: data.name, description: data.description || '' }
              : t
          )
        );
        toast({ title: 'Cập nhật thành công', description: `Đã cập nhật mẫu "${data.name}"` });
      } else {
        const newTemplate: SalaryTemplate = {
          id: Date.now(),
          code: data.code,
          name: data.name,
          description: data.description || '',
          formula: '',
          usedBy: 0,
          status: 'draft',
        };
        setTemplates((prev) => [...prev, newTemplate]);
        toast({ title: 'Thêm thành công', description: `Đã tạo mẫu "${data.name}"` });
      }

      setIsFormModalOpen(false);
      setIsLoading(false);
    }, 800);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));
      toast({ title: 'Xóa thành công', description: `Đã xóa mẫu "${selectedTemplate.name}"` });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra, vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mẫu lương"
        description="Xây dựng và quản lý công thức tính lương"
        action={
          <Button className="touch-target" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo mẫu lương
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pagination.paginatedData.map((template) => (
          <Card key={template.id} className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-manager/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-manager" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                <Badge
                  variant={template.status === 'active' ? 'default' : 'secondary'}
                  className={template.status === 'active' ? 'status-success' : ''}
                >
                  {statusLabels[template.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-secondary/50 font-mono text-sm mb-4">
                {template.formula}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Đang dùng cho {template.usedBy} nhân viên
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <PaginationControls {...pagination} />
      </Card>

      <SalaryTemplateFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        data={selectedTemplate ? {
          id: String(selectedTemplate.id),
          code: selectedTemplate.code,
          name: selectedTemplate.name,
          description: selectedTemplate.description,
        } : null}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa mẫu lương"
        description={`Bạn có chắc chắn muốn xóa mẫu "${selectedTemplate?.name}"? ${
          selectedTemplate?.usedBy
            ? `Mẫu này đang được sử dụng cho ${selectedTemplate.usedBy} nhân viên.`
            : ''
        }`}
        confirmText="Xóa"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}