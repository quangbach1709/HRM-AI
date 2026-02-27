import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Candidate, CandidateFormData, candidateStatusOptions } from '@/types/candidate';
import { api } from '@/services/api';
import { getFileUrl } from '@/services/fileApi';

const candidateFormSchema = z.object({
  candidateCode: z.string().min(1, { message: 'Vui lòng nhập mã ứng viên' }),
  firstName: z.string().min(1, { message: 'Vui lòng nhập họ' }),
  lastName: z.string().min(1, { message: 'Vui lòng nhập tên' }),
  displayName: z.string().min(1, { message: 'Vui lòng nhập tên hiển thị' }),
  email: z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')),
  phoneNumber: z.string().min(1, { message: 'Vui lòng nhập số điện thoại' }),
  positionId: z.string().min(1, { message: 'Vui lòng chọn vị trí' }),
  submissionDate: z.string().min(1, { message: 'Vui lòng chọn ngày nộp hồ sơ' }),
  candidateStatus: z.coerce.number(),
  workExperience: z.string().optional(),
  desiredPay: z.coerce.number().optional(),
  interviewDate: z.string().optional().or(z.literal('')),
  possibleWorkingDate: z.string().optional().or(z.literal('')),
  onboardDate: z.string().optional().or(z.literal('')),
  recruitmentRequestId: z.string().optional().or(z.literal('')),
  introducerId: z.string().optional().or(z.literal('')),
  taxCode: z.string().optional(),
  idNumber: z.string().optional(),
  idNumberIssueBy: z.string().optional(),
  idNumberIssueDate: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  birthPlace: z.string().optional(),
  gender: z.coerce.number().optional(),
  maritalStatus: z.coerce.number().optional(),
  educationLevel: z.coerce.number().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  positions: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; displayName: string }>;
  recruitmentRequests?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  onSubmit: (data: CandidateFormData) => void;
  mode?: 'view' | 'edit' | 'create';
}

export function CandidateFormModal({
  open,
  onOpenChange,
  candidate,
  positions,
  staff,
  recruitmentRequests = [],
  isLoading = false,
  onSubmit,
  mode = candidate ? 'edit' : 'create',
}: CandidateFormModalProps) {
  const isEditing = !!candidate;
  const isViewMode = mode === 'view';
  const { toast } = useToast();

  // CV file upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      candidateCode: '',
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      phoneNumber: '',
      positionId: '',
      submissionDate: new Date().toISOString().split('T')[0],
      candidateStatus: 0,
      workExperience: '',
      desiredPay: undefined,
      interviewDate: '',
      possibleWorkingDate: '',
      onboardDate: '',
      recruitmentRequestId: '',
      introducerId: '',
      taxCode: '',
      idNumber: '',
      idNumberIssueBy: '',
      idNumberIssueDate: '',
      birthDate: '',
      birthPlace: '',
      gender: 0,
      maritalStatus: 0,
      educationLevel: 0
    },
  });

  useEffect(() => {
    if (open) {
      if (candidate) {
        form.reset({
          candidateCode: candidate.candidateCode,
          firstName: candidate.firstName || '',
          lastName: candidate.lastName || '',
          displayName: candidate.displayName || '',
          email: candidate.email || '',
          phoneNumber: candidate.phoneNumber || '',
          positionId: candidate.positionId || candidate.position?.id || '',
          submissionDate: candidate.submissionDate ? new Date(candidate.submissionDate).toISOString().split('T')[0] : '',
          candidateStatus: candidate.candidateStatus,
          workExperience: candidate.workExperience || '',
          desiredPay: candidate.desiredPay,
          interviewDate: candidate.interviewDate ? new Date(candidate.interviewDate).toISOString().split('T')[0] : '',
          possibleWorkingDate: candidate.possibleWorkingDate ? new Date(candidate.possibleWorkingDate).toISOString().split('T')[0] : '',
          onboardDate: candidate.onboardDate ? new Date(candidate.onboardDate).toISOString().split('T')[0] : '',
          recruitmentRequestId: candidate.recruitmentRequestId || candidate.recruitmentRequest?.id || '',
          introducerId: candidate.introducerId || candidate.introducer?.id || '',
          taxCode: candidate.taxCode || '',
          idNumber: candidate.idNumber || '',
          idNumberIssueBy: candidate.idNumberIssueBy || '',
          idNumberIssueDate: candidate.idNumberIssueDate ? new Date(candidate.idNumberIssueDate).toISOString().split('T')[0] : '',
          birthDate: candidate.birthDate ? new Date(candidate.birthDate).toISOString().split('T')[0] : '',
          birthPlace: candidate.birthPlace || '',
          gender: candidate.gender || 0,
          maritalStatus: candidate.maritalStatus || 0,
          educationLevel: candidate.educationLevel || 0
        });
      } else {
        form.reset({
          candidateCode: '',
          firstName: '',
          lastName: '',
          displayName: '',
          email: '',
          phoneNumber: '',
          positionId: '',
          submissionDate: new Date().toISOString().split('T')[0],
          candidateStatus: 0,
          workExperience: '',
          desiredPay: undefined,
          interviewDate: '',
          possibleWorkingDate: '',
          onboardDate: '',
          recruitmentRequestId: '',
          introducerId: '',
          taxCode: '',
          idNumber: '',
          idNumberIssueBy: '',
          idNumberIssueDate: '',
          birthDate: '',
          birthPlace: '',
          gender: 0,
          maritalStatus: 0,
          educationLevel: 0
        });
      }
      // Load existing CV file
      if (candidate?.cvFile) {
        setUploadedCvId(candidate.cvFile.id);
        setUploadedCvName(candidate.cvFile.name);
      } else {
        setUploadedCvId(null);
        setUploadedCvName(null);
        setCvFile(null);
      }
    }
  }, [candidate, form, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.some(ext => fileName.endsWith(ext))) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)',
        variant: 'destructive',
      });
      return;
    }

    setCvFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/file-descriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedCvId(response.data.id);
      setUploadedCvName(response.data.name);
      toast({
        title: 'Thành công',
        description: 'Đã tải lên CV',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải lên CV',
        variant: 'destructive',
      });
      setCvFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (data: CandidateFormValues) => {
    onSubmit({
      ...data,
      id: candidate?.id,
      interviewDate: data.interviewDate || undefined,
      possibleWorkingDate: data.possibleWorkingDate || undefined,
      onboardDate: data.onboardDate || undefined,
      recruitmentRequestId: data.recruitmentRequestId || undefined,
      introducerId: data.introducerId || undefined,
      idNumberIssueDate: data.idNumberIssueDate || undefined,
      birthDate: data.birthDate || undefined,
      email: data.email || undefined,
      cvFileId: uploadedCvId || undefined,
    } as CandidateFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Chi tiết hồ sơ ứng viên' : isEditing ? 'Chỉnh sửa hồ sơ ứng viên' : 'Thêm hồ sơ ứng viên mới'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Xem thông tin chi tiết ứng viên' : isEditing ? 'Cập nhật thông tin ứng viên' : 'Điền thông tin ứng viên'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            {/* --- SECTION 1: PERSONAL INFO --- */}
            <h3 className="font-semibold text-lg border-b pb-2">Thông tin cá nhân</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên *</FormLabel>
                    <FormControl>
                      <Input placeholder="Văn A" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" disabled={isViewMode} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Khác</SelectItem>
                        <SelectItem value="1">Nam</SelectItem>
                        <SelectItem value="2">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- SECTION 2: CANDIDATE INFO --- */}
            <h3 className="font-semibold text-lg border-b pb-2 mt-6">Thông tin ứng tuyển</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã ứng viên *</FormLabel>
                    <FormControl>
                      <Input placeholder="CAND-001" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidateStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidateStatusOptions.map(opt => (
                          <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí ứng tuyển *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recruitmentRequestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theo yêu cầu tuyển dụng</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn yêu cầu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recruitmentRequests.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="submissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày nộp hồ sơ *</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày phỏng vấn</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isViewMode} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kinh nghiệm làm việc</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả kinh nghiệm..."
                      className="resize-none"
                      rows={3}
                      disabled={isViewMode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CV File Upload */}
            <div className="space-y-2">
              <FormLabel>CV (PDF hoặc Word)</FormLabel>
              {isViewMode ? (
                // View mode - just show the file link
                uploadedCvId ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <a
                      href={getFileUrl({ id: uploadedCvId })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {uploadedCvName || 'Xem CV'}
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Chưa có CV</p>
                )
              ) : (
                // Edit mode - allow upload
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                  {(cvFile || uploadedCvId) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">{cvFile?.name || uploadedCvName || 'CV đã tải lên'}</span>
                      </div>
                      {uploadedCvId && (
                        <a
                          href={getFileUrl({ id: uploadedCvId })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Xem CV hiện tại
                        </a>
                      )}
                      <p className="text-sm text-muted-foreground">Click để thay thế file mới</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-sm">Click để chọn file CV</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tải lên...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {isViewMode ? 'Đóng' : 'Hủy'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
