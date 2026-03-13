import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { publicCandidateApi } from '@/services/candidateApi';
import { Candidate, CandidateFormData } from '@/types/candidate';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getFileUrl } from '@/services/fileApi';

const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9000'}/api/v1/hr`;
const LOCAL_STORAGE_KEY = 'candidate_application_data';

// Full form schema matching HR CandidateFormModal
const candidateApplySchema = z.object({
    firstName: z.string().min(1, { message: 'Vui lòng nhập họ' }),
    lastName: z.string().min(1, { message: 'Vui lòng nhập tên' }),
    displayName: z.string().min(1, { message: 'Vui lòng nhập tên hiển thị' }),
    email: z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')),
    phoneNumber: z.string().min(1, { message: 'Vui lòng nhập số điện thoại' }),
    positionId: z.string().min(1, { message: 'Vui lòng chọn vị trí' }),
    recruitmentRequestId: z.string().optional().or(z.literal('')),
    workExperience: z.string().optional(),
    desiredPay: z.coerce.number().optional(),
    possibleWorkingDate: z.string().optional().or(z.literal('')),
    // Person info
    birthDate: z.string().optional().or(z.literal('')),
    birthPlace: z.string().optional(),
    gender: z.coerce.number().optional(),
    idNumber: z.string().optional(),
    idNumberIssueBy: z.string().optional(),
    idNumberIssueDate: z.string().optional().or(z.literal('')),
    maritalStatus: z.coerce.number().optional(),
    taxCode: z.string().optional(),
    educationLevel: z.coerce.number().optional(),
});

type CandidateApplyFormValues = z.infer<typeof candidateApplySchema>;

interface SavedCandidateData {
    candidate: Candidate;
    submittedAt: string;
}

export default function CandidateApplyPage() {
    const { toast } = useToast();
    const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);
    const [recruitmentRequests, setRecruitmentRequests] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploadedCvId, setUploadedCvId] = useState<string | null>(null);
    const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [savedCandidate, setSavedCandidate] = useState<SavedCandidateData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const form = useForm<CandidateApplyFormValues>({
        resolver: zodResolver(candidateApplySchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            displayName: '',
            email: '',
            phoneNumber: '',
            positionId: '',
            recruitmentRequestId: '',
            workExperience: '',
            desiredPay: undefined,
            possibleWorkingDate: '',
            birthDate: '',
            birthPlace: '',
            gender: 0,
            idNumber: '',
            idNumberIssueBy: '',
            idNumberIssueDate: '',
            maritalStatus: 0,
            taxCode: '',
            educationLevel: 0,
        },
    });

    // Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            try {
                const parsed: SavedCandidateData = JSON.parse(savedData);
                setSavedCandidate(parsed);
                populateFormFromCandidate(parsed.candidate);
                setIsEditMode(true);
                if (parsed.candidate.cvFile) {
                    setUploadedCvId(parsed.candidate.cvFile.id);
                    setUploadedCvName(parsed.candidate.cvFile.name);
                }
            } catch (e) {
                console.error('Failed to parse saved candidate data', e);
            }
        }
    }, []);

    // Load positions and recruitment requests
    useEffect(() => {
        const loadData = async () => {
            try {
                const [posRes, reqRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/positions/all`),
                    axios.get(`${API_BASE_URL}/recruitment-requests/all`)
                ]);
                setPositions(posRes.data);
                setRecruitmentRequests(reqRes.data);
            } catch (e) {
                console.error('Failed to load positions/recruitment requests', e);
            }
        };
        loadData();
    }, []);

    const populateFormFromCandidate = (candidate: Candidate) => {
        form.reset({
            firstName: candidate.firstName || '',
            lastName: candidate.lastName || '',
            displayName: candidate.displayName || '',
            email: candidate.email || '',
            phoneNumber: candidate.phoneNumber || '',
            positionId: candidate.position?.id || '',
            recruitmentRequestId: candidate.recruitmentRequest?.id || '',
            workExperience: candidate.workExperience || '',
            desiredPay: candidate.desiredPay,
            possibleWorkingDate: candidate.possibleWorkingDate ? new Date(candidate.possibleWorkingDate).toISOString().split('T')[0] : '',
            birthDate: candidate.birthDate ? new Date(candidate.birthDate).toISOString().split('T')[0] : '',
            birthPlace: candidate.birthPlace || '',
            gender: candidate.gender || 0,
            idNumber: candidate.idNumber || '',
            idNumberIssueBy: candidate.idNumberIssueBy || '',
            idNumberIssueDate: candidate.idNumberIssueDate ? new Date(candidate.idNumberIssueDate).toISOString().split('T')[0] : '',
            maritalStatus: candidate.maritalStatus || 0,
            taxCode: candidate.taxCode || '',
            educationLevel: candidate.educationLevel || 0,
        });
    };

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
            const result = await publicCandidateApi.uploadCv(file);
            setUploadedCvId(result.id);
            setUploadedCvName(result.name);
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

    const handleSubmit = async (data: CandidateApplyFormValues) => {
        setIsLoading(true);

        try {
            const formData: CandidateFormData = {
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.displayName,
                email: data.email || undefined,
                phoneNumber: data.phoneNumber,
                positionId: data.positionId,
                recruitmentRequestId: data.recruitmentRequestId || undefined,
                candidateCode: '', // Will be auto-generated
                submissionDate: new Date().toISOString().split('T')[0],
                candidateStatus: 0,
                workExperience: data.workExperience,
                desiredPay: data.desiredPay,
                possibleWorkingDate: data.possibleWorkingDate || undefined,
                birthDate: data.birthDate || undefined,
                birthPlace: data.birthPlace,
                gender: data.gender,
                idNumber: data.idNumber,
                idNumberIssueBy: data.idNumberIssueBy,
                idNumberIssueDate: data.idNumberIssueDate || undefined,
                maritalStatus: data.maritalStatus,
                taxCode: data.taxCode,
                educationLevel: data.educationLevel,
                cvFileId: uploadedCvId || undefined,
            };

            let result: Candidate;
            if (savedCandidate?.candidate?.id) {
                result = await publicCandidateApi.update(savedCandidate.candidate.id, formData);
            } else {
                result = await publicCandidateApi.create(formData);
            }

            // Save to localStorage
            const dataToSave: SavedCandidateData = {
                candidate: result,
                submittedAt: new Date().toISOString(),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            setSavedCandidate(dataToSave);

            setIsSuccess(true);
            toast({
                title: 'Thành công',
                description: isEditMode ? 'Đã cập nhật hồ sơ ứng tuyển' : 'Đã gửi hồ sơ ứng tuyển',
            });
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.response?.data?.message || 'Có lỗi xảy ra khi gửi hồ sơ',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewApplication = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setSavedCandidate(null);
        setIsEditMode(false);
        setIsSuccess(false);
        setUploadedCvId(null);
        setUploadedCvName(null);
        setCvFile(null);
        form.reset();
    };

    if (isSuccess && savedCandidate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {isEditMode ? 'Cập nhật thành công!' : 'Nộp hồ sơ thành công!'}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Mã ứng viên của bạn là:
                        </p>
                        <p className="text-xl font-mono font-bold text-blue-600 bg-blue-50 py-2 px-4 rounded mb-4">
                            {savedCandidate.candidate.candidateCode}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Thông tin đã được lưu. Nếu bạn quay lại trang này, bạn có thể chỉnh sửa hồ sơ của mình.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => { setIsSuccess(false); setIsEditMode(true); }}>
                                Chỉnh sửa hồ sơ
                            </Button>
                            <Button variant="outline" onClick={handleNewApplication}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Tạo hồ sơ mới
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? 'Chỉnh sửa hồ sơ ứng tuyển' : 'Ứng tuyển vị trí'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode
                            ? `Mã ứng viên: ${savedCandidate?.candidate.candidateCode}`
                            : 'Điền thông tin và tải lên CV để ứng tuyển'}
                    </p>
                    {isEditMode && (
                        <Button variant="link" className="mt-2" onClick={handleNewApplication}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tạo hồ sơ mới (xóa dữ liệu hiện tại)
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditMode ? 'Chỉnh sửa thông tin' : 'Thông tin ứng tuyển'}</CardTitle>
                        <CardDescription>
                            Điền đầy đủ thông tin cá nhân và tải lên CV
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                                {/* Section 1: Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Thông tin cá nhân</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nguyễn" {...field} />
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
                                                        <Input placeholder="Văn A" {...field} />
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
                                                    <Input placeholder="Nguyễn Văn A" {...field} />
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
                                                        <Input placeholder="0901234567" {...field} />
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
                                                        <Input placeholder="email@example.com" {...field} />
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
                                                        <Input type="date" {...field} />
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
                                                    <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
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

                                    <FormField
                                        control={form.control}
                                        name="birthPlace"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nơi sinh</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Hà Nội" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="idNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số CMND/CCCD</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123456789012" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="idNumberIssueBy"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nơi cấp</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="CA Hà Nội" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="idNumberIssueDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ngày cấp</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="maritalStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tình trạng hôn nhân</FormLabel>
                                                    <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="0">Độc thân</SelectItem>
                                                            <SelectItem value="1">Đã kết hôn</SelectItem>
                                                            <SelectItem value="2">Ly hôn</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="educationLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Trình độ học vấn</FormLabel>
                                                    <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="0">Phổ thông</SelectItem>
                                                            <SelectItem value="1">Trung cấp</SelectItem>
                                                            <SelectItem value="2">Cao đẳng</SelectItem>
                                                            <SelectItem value="3">Đại học</SelectItem>
                                                            <SelectItem value="4">Thạc sĩ</SelectItem>
                                                            <SelectItem value="5">Tiến sĩ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="taxCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mã số thuế</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="1234567890" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Job Application Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Thông tin ứng tuyển</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="positionId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vị trí ứng tuyển *</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn yêu cầu (tùy chọn)" />
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
                                            name="desiredPay"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mức lương mong muốn (VND)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="15000000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="possibleWorkingDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ngày có thể bắt đầu làm việc</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
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
                                                        placeholder="Mô tả kinh nghiệm làm việc của bạn..."
                                                        className="resize-none"
                                                        rows={4}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Section 3: CV Upload */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">CV / Hồ sơ</h3>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
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
                                                        Xem CV
                                                    </a>
                                                )}
                                                <p className="text-sm text-muted-foreground">Click để thay thế file mới</p>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground">
                                                <Upload className="h-8 w-8 mx-auto mb-2" />
                                                <p>Click để chọn file CV (PDF hoặc Word)</p>
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
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditMode ? 'Cập nhật hồ sơ' : 'Nộp hồ sơ ứng tuyển'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
