import { useState } from 'react';
import { Loader2, FileText, Download, Star } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Candidate, candidateStatusOptions } from '@/types/candidate';
import { getFileUrl } from '@/services/fileApi';

interface CandidateScoringModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidate: Candidate | null;
    isLoading?: boolean;
    onSubmit: (score: number) => void;
}

export function CandidateScoringModal({
    open,
    onOpenChange,
    candidate,
    isLoading = false,
    onSubmit,
}: CandidateScoringModalProps) {
    const [score, setScore] = useState<string>(String(candidate?.score || ''));

    const handleSubmit = () => {
        const scoreValue = parseFloat(score);
        if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
            alert('Điểm phải là số từ 0 đến 100');
            return;
        }
        onSubmit(scoreValue);
    };

    if (!candidate) return null;

    const status = candidateStatusOptions.find(s => s.value === candidate.candidateStatus);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Chấm điểm ứng viên
                    </DialogTitle>
                    <DialogDescription>
                        Xem thông tin ứng viên và yêu cầu tuyển dụng để đánh giá
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Candidate Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 text-blue-600">
                            Thông tin ứng viên
                        </h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã ứng viên:</span>
                                <span className="font-medium">{candidate.candidateCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Họ và tên:</span>
                                <span className="font-medium">{candidate.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span>{candidate.email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Số điện thoại:</span>
                                <span>{candidate.phoneNumber || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vị trí ứng tuyển:</span>
                                <span className="font-medium">{candidate.position?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Trạng thái:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium
                  ${candidate.candidateStatus === 0 ? 'bg-gray-100 text-gray-800' : ''}
                  ${candidate.candidateStatus === 1 ? 'bg-blue-100 text-blue-800' : ''}
                  ${candidate.candidateStatus === 2 ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${candidate.candidateStatus === 3 ? 'bg-green-100 text-green-800' : ''}
                  ${candidate.candidateStatus === 4 ? 'bg-red-100 text-red-800' : ''}
                `}>
                                    {status?.label || 'Chưa xác định'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mức lương mong muốn:</span>
                                <span>{candidate.desiredPay ? `${candidate.desiredPay.toLocaleString()}đ` : '-'}</span>
                            </div>
                        </div>

                        {/* Work Experience */}
                        {candidate.workExperience && (
                            <div className="mt-4">
                                <Label className="text-muted-foreground">Kinh nghiệm làm việc:</Label>
                                <p className="text-sm mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                                    {candidate.workExperience}
                                </p>
                            </div>
                        )}

                        {/* CV File */}
                        {candidate.cvFile && (
                            <div className="mt-4 p-3 border rounded-lg bg-blue-50">
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    File CV:
                                </Label>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-medium">{candidate.cvFile.name}</span>
                                    <Button size="sm" variant="outline" asChild>
                                        <a href={getFileUrl(candidate.cvFile)} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-1" />
                                            Xem CV
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Current Score */}
                        {candidate.score !== undefined && candidate.score !== null && (
                            <div className="mt-4 p-3 border rounded-lg bg-yellow-50">
                                <Label className="text-muted-foreground">Điểm hiện tại:</Label>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">
                                    {candidate.score} / 100
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Recruitment Request Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2 text-green-600">
                            Yêu cầu tuyển dụng
                        </h3>

                        {candidate.recruitmentRequest ? (
                            <div className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tên yêu cầu:</span>
                                        <span className="font-medium">{candidate.recruitmentRequest.name}</span>
                                    </div>
                                </div>

                                {candidate.recruitmentRequest.description && (
                                    <div>
                                        <Label className="text-muted-foreground">Mô tả công việc:</Label>
                                        <p className="text-sm mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                                            {candidate.recruitmentRequest.description}
                                        </p>
                                    </div>
                                )}

                                {candidate.recruitmentRequest.request && (
                                    <div>
                                        <Label className="text-muted-foreground">Yêu cầu ứng viên:</Label>
                                        <p className="text-sm mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                                            {candidate.recruitmentRequest.request}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">
                                Ứng viên chưa được liên kết với yêu cầu tuyển dụng nào
                            </p>
                        )}

                        {/* Score Input */}
                        <div className="mt-6 p-4 border-2 border-dashed border-yellow-400 rounded-lg bg-yellow-50">
                            <Label htmlFor="score" className="text-lg font-semibold flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Nhập điểm đánh giá (0-100)
                            </Label>
                            <Input
                                id="score"
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="mt-2 text-xl font-bold text-center"
                                placeholder="Nhập điểm..."
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Star className="mr-2 h-4 w-4" />
                        Lưu điểm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
