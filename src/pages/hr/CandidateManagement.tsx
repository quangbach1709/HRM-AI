import { useState, useCallback, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ColumnDef } from '@/types/pagination';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Candidate, candidateStatusOptions, CandidateFormData } from '@/types/candidate';
import { candidateApi } from '@/services/candidateApi';
import { useCandidates } from '@/hooks/useCandidates';
import { CandidateFormModal } from '@/components/modals/CandidateFormModal';
import { CandidateScoringModal } from '@/components/modals/CandidateScoringModal';
import { positionApi } from '@/services/positionApi';
import { staffApi } from '@/services/staffApi';
import { recruitmentRequestApi } from '@/services/recruitmentApi';


export default function CandidateManagement() {
  const {
    data,
    loading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    refresh
  } = useCandidates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [scoringCandidate, setScoringCandidate] = useState<Candidate | null>(null);
  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const { toast } = useToast();

  // Data for Selects
  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
  const [staff, setStaff] = useState<Array<{ id: string; displayName: string }>>([]);
  const [recruitmentRequests, setRecruitmentRequests] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [posData, staffData, reqData] = await Promise.all([
          positionApi.getAll(),
          staffApi.getAll(),
          recruitmentRequestApi.getAll()
        ]);
        setPositions(posData);
        setStaff(staffData);
        setRecruitmentRequests(reqData);
      } catch (e) {
        console.error("Failed to load dependency data", e);
      }
    }
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedCandidate(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleView = useCallback((candidate: Candidate) => {
    setViewingCandidate(candidate);
    setIsViewModalOpen(true);
  }, []);

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ ứng viên này?')) return;
    try {
      await candidateApi.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa hồ sơ ứng viên",
        variant: "default",
      });
      refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hồ sơ",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (formData: CandidateFormData) => {
    try {
      if (selectedCandidate) {
        await candidateApi.update(selectedCandidate.id, formData);
        toast({ title: "Thành công", description: "Cập nhật hồ sơ thành công" });
      } else {
        await candidateApi.create(formData);
        toast({ title: "Thành công", description: "Tạo hồ sơ mới thành công" });
      }
      setIsModalOpen(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const handleScore = useCallback((candidate: Candidate) => {
    setScoringCandidate(candidate);
    setIsScoringModalOpen(true);
  }, []);

  const handleScoreSubmit = async (score: number) => {
    if (!scoringCandidate) return;
    setIsScoringLoading(true);
    try {
      await candidateApi.updateScore(scoringCandidate.id, score);
      toast({ title: "Thành công", description: "Đã cập nhật điểm ứng viên" });
      setIsScoringModalOpen(false);
      refresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật điểm",
        variant: "destructive",
      });
    } finally {
      setIsScoringLoading(false);
    }
  };

  const columns: ColumnDef<Candidate>[] = useMemo(() => [
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="Xem">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleScore(row); }} title="Chấm điểm">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-800 hover:bg-orange-50" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Sửa">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} title="Xóa">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      key: 'candidateCode',
      header: 'Mã ứng viên',
      sortable: true,
      sortKey: 'candidateCode',
      filterable: true,
      filterType: 'text',
      filterKey: 'candidateCode',
      width: '120px',
    },
    {
      key: 'displayName',
      header: 'Họ và tên',
      sortable: false,
      filterable: true,
      filterType: 'text',
      filterKey: 'keyword',
      width: '180px',
    },
    {
      key: 'email',
      header: 'Email',
      sortable: false,
      width: '180px',
    },
    {
      key: 'phoneNumber',
      header: 'SĐT',
      sortable: false,
      width: '120px',
    },
    {
      key: 'position.name',
      header: 'Vị trí',
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterKey: 'positionId',
      filterOptions: positions.map(p => ({ label: p.name, value: p.id })),
      width: '150px',
      render: (_, row) => row.position?.name || '-',
    },
    {
      key: 'candidateStatus',
      header: 'Trạng thái',
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterKey: 'candidateStatus',
      filterOptions: candidateStatusOptions.map(opt => ({ label: opt.label, value: String(opt.value) })),
      width: '140px',
      render: (val) => {
        const option = candidateStatusOptions.find(o => o.value === val);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold
            ${val === 0 ? 'bg-gray-100 text-gray-800' : ''}
            ${val === 1 ? 'bg-blue-100 text-blue-800' : ''}
            ${val === 2 ? 'bg-yellow-100 text-yellow-800' : ''}
            ${val === 3 ? 'bg-green-100 text-green-800' : ''}
            ${val === 4 ? 'bg-red-100 text-red-800' : ''}
          `}>
            {option?.label || 'Chưa xác định'}
          </span>
        );
      }
    },
    {
      key: 'submissionDate',
      header: 'Ngày nộp',
      sortable: true,
      sortKey: 'submissionDate',
      width: '120px',
      render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'score',
      header: 'Điểm',
      sortable: true,
      sortKey: 'score',
      width: '80px',
      render: (val) => val !== null && val !== undefined ? (
        <span className="font-semibold text-yellow-600">{val}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  ], [positions, handleView, handleScore, handleEdit, handleDelete]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý ứng viên</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách và trạng thái ứng viên tuyển dụng
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm ứng viên
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        sortBy={searchParams.sortBy}
        sortDirection={searchParams.sortDirection}
        onSort={handleSort}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowKey="id"
      />

      <CandidateFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        candidate={selectedCandidate}
        positions={positions}
        staff={staff}
        recruitmentRequests={recruitmentRequests}
        onSubmit={handleFormSubmit}
        mode={modalMode}
      />

      <CandidateFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        candidate={viewingCandidate}
        positions={positions}
        staff={staff}
        recruitmentRequests={recruitmentRequests}
        onSubmit={async () => { }}
        mode="view"
      />

      <CandidateScoringModal
        open={isScoringModalOpen}
        onOpenChange={setIsScoringModalOpen}
        candidate={scoringCandidate}
        isLoading={isScoringLoading}
        onSubmit={handleScoreSubmit}
      />
    </div>
  );
}
