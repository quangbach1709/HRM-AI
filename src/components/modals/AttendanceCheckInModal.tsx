import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StaffWorkScheduleFormData } from '../../types/staffWorkSchedule';
import { staffWorkScheduleApi } from '../../services/staffWorkScheduleApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Clock, User, Calendar, Camera, Video, RefreshCw, SwitchCamera } from 'lucide-react';

interface AttendanceCheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SHIFT_WORK_TYPES = [
    { value: 1, label: 'Ca sáng (8:30 - 12:00)' },
    { value: 2, label: 'Ca chiều (13:30 - 17:30)' },
    { value: 3, label: 'Ca nguyên ngày (8:30 - 17:30)' },
];

// Constants
const VIDEO_DURATION_MS = 3000; // 3 seconds
const MIN_FRAMES = 5;

export function AttendanceCheckInModal({
    isOpen,
    onClose,
    onSuccess,
}: AttendanceCheckInModalProps) {
    const { staff } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [shiftWorkType, setShiftWorkType] = useState<number>(3);
    const today = new Date().toISOString().split('T')[0];

    // Camera states
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [capturedImage, setCapturedImage] = useState<{ file: File; previewUrl: string } | null>(null);

    // Video recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingProgress, setRecordingProgress] = useState(0);
    const [requiresVideoVerification, setRequiresVideoVerification] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedFramesRef = useRef<File[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup
    useEffect(() => {
        return () => {
            stopCamera();
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, []);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
            setErrorMessage(null);
        } catch (error) {
            toast({
                title: 'Lỗi camera',
                description: 'Không thể truy cập camera. Vui lòng cấp quyền.',
                variant: 'destructive',
            });
        }
    }, [facingMode, toast]);

    // Attach stream to video element when it becomes available
    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCameraOpen]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    }, []);

    const switchCamera = useCallback(() => {
        stopCamera();
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, [stopCamera]);

    // Re-open camera when facingMode changes
    useEffect(() => {
        if (isCameraOpen || requiresVideoVerification) {
            startCamera();
        }
    }, [facingMode]);

    const captureFrame = useCallback((): Promise<File | null> => {
        return new Promise((resolve) => {
            if (!videoRef.current || !canvasRef.current) {
                resolve(null);
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }

            // Use full resolution from video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

            // Use maximum quality (1.0)
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, 'image/jpeg', 1.0);
        });
    }, []);

    const capturePhoto = useCallback(async () => {
        const file = await captureFrame();
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCapturedImage({ file, previewUrl });
            stopCamera();
        }
    }, [captureFrame, stopCamera]);

    const handleRetake = useCallback(() => {
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage.previewUrl);
            setCapturedImage(null);
        }
        setRequiresVideoVerification(false);
        setErrorMessage(null);
        recordedFramesRef.current = [];
        startCamera();
    }, [capturedImage, startCamera]);

    // Video recording
    const startVideoRecording = useCallback(async () => {
        if (!videoRef.current) return;

        setIsRecording(true);
        setRecordingProgress(0);
        recordedFramesRef.current = [];

        const startTime = Date.now();
        const captureInterval = VIDEO_DURATION_MS / (MIN_FRAMES + 3); // Capture more than minimum

        recordingIntervalRef.current = setInterval(async () => {
            const elapsed = Date.now() - startTime;
            setRecordingProgress(Math.min((elapsed / VIDEO_DURATION_MS) * 100, 100));

            // Capture frame
            const file = await captureFrame();
            if (file) {
                recordedFramesRef.current.push(file);
            }

            // Stop after duration
            if (elapsed >= VIDEO_DURATION_MS) {
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                    recordingIntervalRef.current = null;
                }
                setIsRecording(false);
                stopCamera();

                // Select random frames
                const frames = recordedFramesRef.current;
                if (frames.length >= MIN_FRAMES) {
                    // Shuffle and pick MIN_FRAMES
                    const shuffled = [...frames].sort(() => Math.random() - 0.5);
                    const selectedFrames = shuffled.slice(0, Math.max(MIN_FRAMES, Math.min(frames.length, 8)));
                    await submitWithFrames(selectedFrames);
                } else {
                    toast({
                        title: 'Lỗi ghi video',
                        description: `Không đủ frames (${frames.length}/${MIN_FRAMES}). Vui lòng thử lại.`,
                        variant: 'destructive',
                    });
                    setRequiresVideoVerification(true);
                }
            }
        }, captureInterval);
    }, [captureFrame, stopCamera, toast]);

    const submitWithFrames = useCallback(async (frames: File[]) => {
        if (!staff?.id) return;

        setLoading(true);
        try {
            const submitData: StaffWorkScheduleFormData = {
                staffId: staff.id,
                workingDate: today,
                shiftWorkType: shiftWorkType,
            };

            await staffWorkScheduleApi.attendance(submitData, frames);

            toast({
                title: 'Chấm công thành công!',
                description: `Đã chấm công lúc ${new Date().toLocaleTimeString('vi-VN')}`,
                variant: 'default',
            });
            onSuccess();
            handleClose();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setErrorMessage(message);
            toast({ title: 'Lỗi chấm công', description: message, variant: 'destructive' });
            // If video verification was tried, allow retry
            if (requiresVideoVerification) {
                setRequiresVideoVerification(true);
            }
        } finally {
            setLoading(false);
        }
    }, [staff?.id, today, shiftWorkType, toast, onSuccess, requiresVideoVerification]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!staff?.id) {
            toast({
                title: 'Lỗi',
                description: 'Không tìm thấy thông tin nhân viên',
                variant: 'destructive',
            });
            return;
        }

        if (!capturedImage) {
            toast({
                title: 'Yêu cầu ảnh',
                description: 'Vui lòng chụp ảnh khuôn mặt để chấm công',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setErrorMessage(null);
        try {
            const submitData: StaffWorkScheduleFormData = {
                staffId: staff.id,
                workingDate: today,
                shiftWorkType: shiftWorkType,
            };

            await staffWorkScheduleApi.attendance(submitData, [capturedImage.file]);

            toast({
                title: 'Chấm công thành công!',
                description: `Đã chấm công lúc ${new Date().toLocaleTimeString('vi-VN')}`,
                variant: 'default',
            });
            onSuccess();
            handleClose();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setErrorMessage(message);
            // Trigger video verification on failure
            setRequiresVideoVerification(true);
            if (capturedImage) {
                URL.revokeObjectURL(capturedImage.previewUrl);
                setCapturedImage(null);
            }
            toast({
                title: 'Cần xác minh thêm',
                description: 'Vui lòng quay video ngắn 3 giây để xác minh.',
                variant: 'destructive',
            });
            startCamera();
        } finally {
            setLoading(false);
        }
    }, [staff?.id, capturedImage, today, shiftWorkType, toast, onSuccess, startCamera]);

    const handleClose = useCallback(() => {
        stopCamera();
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage.previewUrl);
            setCapturedImage(null);
        }
        setRequiresVideoVerification(false);
        setErrorMessage(null);
        recordedFramesRef.current = [];
        onClose();
    }, [stopCamera, capturedImage, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Chấm công
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Staff & Date Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1 text-xs">
                                <User className="w-3 h-3" /> Nhân viên
                            </Label>
                            <Input value={staff?.displayName || staff?.staffCode || '...'} disabled className="bg-muted h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1 text-xs">
                                <Calendar className="w-3 h-3" /> Ngày
                            </Label>
                            <Input type="date" value={today} disabled className="bg-muted h-8 text-sm" />
                        </div>
                    </div>

                    {/* Shift Type */}
                    <div className="space-y-1">
                        <Label className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" /> Ca làm việc
                        </Label>
                        <Select value={String(shiftWorkType)} onValueChange={(v) => setShiftWorkType(Number(v))}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Chọn ca" />
                            </SelectTrigger>
                            <SelectContent>
                                {SHIFT_WORK_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Camera Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">
                                {requiresVideoVerification ? '📹 Xác minh bằng video (3 giây)' : '📷 Xác thực khuôn mặt'}
                            </Label>
                            {isCameraOpen && (
                                <Button type="button" variant="ghost" size="sm" onClick={switchCamera} className="h-6 px-2 text-xs">
                                    <SwitchCamera className="w-3 h-3 mr-1" /> Đổi camera
                                </Button>
                            )}
                        </div>

                        <div className="relative border rounded-lg overflow-hidden bg-slate-900 min-h-[220px] flex items-center justify-center">
                            {capturedImage ? (
                                <div className="relative w-full h-full">
                                    <img src={capturedImage.previewUrl} alt="Captured" className="w-full h-full object-contain" />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="absolute bottom-2 right-2"
                                        onClick={handleRetake}
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" /> Chụp lại
                                    </Button>
                                </div>
                            ) : isCameraOpen ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover max-h-[250px]"
                                    />
                                    {/* Face guide overlay */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-48 h-60 border-4 border-white/50 rounded-[50%] shadow-lg" />
                                    </div>
                                    {/* Recording progress */}
                                    {isRecording && (
                                        <div className="absolute top-2 left-2 right-2">
                                            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
                                                <span className="animate-pulse">●</span> Đang quay... {Math.round(recordingProgress)}%
                                            </div>
                                            <div className="mt-1 bg-gray-300 rounded-full h-1">
                                                <div className="bg-red-500 h-1 rounded-full transition-all" style={{ width: `${recordingProgress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    <canvas ref={canvasRef} className="hidden" />
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-400 mb-3">
                                        {requiresVideoVerification
                                            ? 'Vui lòng quay video để xác minh'
                                            : 'Vui lòng chụp ảnh để xác minh'}
                                    </p>
                                    <Button type="button" onClick={startCamera} variant="outline">
                                        <Camera className="w-4 h-4 mr-2" /> Mở Camera
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {errorMessage && (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                                {errorMessage}
                            </div>
                        )}

                        {/* Camera action buttons */}
                        {isCameraOpen && !isRecording && !capturedImage && (
                            <div className="flex justify-center gap-2">
                                {requiresVideoVerification ? (
                                    <Button type="button" onClick={startVideoRecording} variant="destructive">
                                        <Video className="w-4 h-4 mr-2" /> Bắt đầu quay (3s)
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={capturePhoto} variant="default">
                                        <Camera className="w-4 h-4 mr-2" /> Chụp ảnh
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading || isRecording}>
                            Huỷ
                        </Button>
                        {!requiresVideoVerification && (
                            <Button type="submit" disabled={loading || !staff || !capturedImage || isRecording}>
                                {loading ? 'Đang xác thực...' : 'Chấm công'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
