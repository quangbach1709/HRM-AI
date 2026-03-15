import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, CheckCircle, Clock, XCircle, Loader2, Video, ImageIcon, RotateCcw, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { faceEmbeddingApi } from '@/services/faceEmbeddingApi';
import { FaceEmbedding } from '@/types/face-embedding';
import { getFileUrl } from '@/services/fileApi';

interface CapturedImage {
  id: string;
  file: File;
  previewUrl: string;
  angle: 'front' | 'left' | 'right';
  label: string;
}

const angleConfig = {
  front: { label: 'Mặt trực diện', description: 'Nhìn thẳng vào camera' },
  left: { label: 'Nghiêng trái', description: 'Nghiêng mặt sang trái, nhưng vẫn nhìn vào camera' },
  right: { label: 'Nghiêng phải', description: 'Nghiêng mặt sang phải, nhưng vẫn nhìn vào camera' },
};

export default function FaceRegistration() {
  const { toast } = useToast();
  const { person } = useAuth();
  const [registrations, setRegistrations] = useState<FaceEmbedding[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right'>('front');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load registration history
  const loadHistory = useCallback(async () => {
    if (!person?.id) return;
    setIsLoadingHistory(true);
    try {
      const data = await faceEmbeddingApi.search({
        personId: person.id,
        pageIndex: 0,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      });
      setRegistrations(data.content || []);
    } catch (error: any) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [person?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      toast({
        title: 'Lỗi camera',
        description: 'Không thể truy cập camera. Vui lòng cấp quyền truy cập.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `face_${currentAngle}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);

          // Check if this angle already exists
          const existingIndex = capturedImages.findIndex((img) => img.angle === currentAngle);
          if (existingIndex >= 0) {
            // Replace existing
            setCapturedImages((prev) => {
              const updated = [...prev];
              URL.revokeObjectURL(updated[existingIndex].previewUrl);
              updated[existingIndex] = {
                id: Date.now().toString(),
                file,
                previewUrl,
                angle: currentAngle,
                label: angleConfig[currentAngle].label,
              };
              return updated;
            });
          } else {
            // Add new
            setCapturedImages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                file,
                previewUrl,
                angle: currentAngle,
                label: angleConfig[currentAngle].label,
              },
            ]);
          }

          // Auto advance to next angle
          if (currentAngle === 'front') setCurrentAngle('left');
          else if (currentAngle === 'left') setCurrentAngle('right');

          toast({
            title: 'Đã chụp ảnh',
            description: `Ảnh ${angleConfig[currentAngle].label} đã được chụp.`,
          });
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileUpload = (angle: 'front' | 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const existingIndex = capturedImages.findIndex((img) => img.angle === angle);

      if (existingIndex >= 0) {
        setCapturedImages((prev) => {
          const updated = [...prev];
          URL.revokeObjectURL(updated[existingIndex].previewUrl);
          updated[existingIndex] = {
            id: Date.now().toString(),
            file,
            previewUrl,
            angle,
            label: angleConfig[angle].label,
          };
          return updated;
        });
      } else {
        setCapturedImages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            file,
            previewUrl,
            angle,
            label: angleConfig[angle].label,
          },
        ]);
      }
    }
  };

  const removeImage = (id: string) => {
    setCapturedImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleRegister = async () => {
    if (capturedImages.length < 3) {
      toast({
        title: 'Chưa đủ ảnh',
        description: 'Vui lòng chụp hoặc tải lên đủ 3 ảnh (trực diện, nghiêng trái, nghiêng phải).',
        variant: 'destructive',
      });
      return;
    }

    // Sắp xếp ảnh theo thứ tự: front → left → right để AI Service nhận đúng thứ tự góc
    const orderedImages = ['front', 'left', 'right']
      .map((angle) => capturedImages.find((img) => img.angle === angle))
      .filter(Boolean) as typeof capturedImages;

    setIsUploading(true);
    try {
      const files = orderedImages.map((img) => img.file);
      const result = await faceEmbeddingApi.registerFace(files);

      toast({
        title: 'Đăng ký thành công',
        description: result.message || '3 ảnh khuôn mặt đã được gửi đi. Vui lòng chờ HR xét duyệt.',
      });

      // Clear captured images
      capturedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setCapturedImages([]);
      stopCamera();

      // Reload history sau một khoảng thời gian ngắn để RabbitMQ kịp xử lý
      setTimeout(() => loadHistory(), 2000);
    } catch (error: any) {
      const detail = error.response?.data?.detail || error.response?.data?.error || error.message || 'Đăng ký khuôn mặt thất bại.';
      toast({
        title: 'Lỗi đăng ký',
        description: detail,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getImageByAngle = (angle: 'front' | 'left' | 'right') => {
    return capturedImages.find((img) => img.angle === angle);
  };

  return (
    <div>
      <PageHeader
        title="Đăng ký khuôn mặt"
        description="Đăng ký khuôn mặt để sử dụng cho chấm công"
      />

      {/* Registration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Đăng ký ảnh mới
          </CardTitle>
          <CardDescription>
            Chụp hoặc tải lên 3 ảnh khuôn mặt ở 3 góc độ khác nhau
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Hướng dẫn chụp ảnh:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Mặt trực diện:</strong> Nhìn thẳng vào camera</li>
              <li>• <strong>Nghiêng trái:</strong> Nghiêng mặt sang trái ~20-30°, nhưng <strong>vẫn nhìn vào camera</strong> (đảm bảo thấy đủ 2 mắt)</li>
              <li>• <strong>Nghiêng phải:</strong> Nghiêng mặt sang phải ~20-30°, nhưng <strong>vẫn nhìn vào camera</strong> (đảm bảo thấy đủ 2 mắt)</li>
              <li>• Đủ ánh sáng, không đeo kính râm, không che mặt</li>
            </ul>
          </div>

          {/* Camera Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant={isCameraOpen ? 'destructive' : 'default'}
                onClick={isCameraOpen ? stopCamera : startCamera}
              >
                {isCameraOpen ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Tắt Camera
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Mở Camera
                  </>
                )}
              </Button>
              {isCameraOpen && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Đang chụp:</span>
                  <Badge variant={currentAngle === 'front' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCurrentAngle('front')}>
                    Trực diện
                  </Badge>
                  <Badge variant={currentAngle === 'left' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCurrentAngle('left')}>
                    Nghiêng trái
                  </Badge>
                  <Badge variant={currentAngle === 'right' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCurrentAngle('right')}>
                    Nghiêng phải
                  </Badge>
                </div>
              )}
            </div>

            {isCameraOpen && (
              <div className="relative inline-block overflow-hidden rounded-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-lg border border-border max-w-md"
                />

                {/* Face guide overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 border-4 border-white/50 rounded-[50%] shadow-lg" />
                </div>

                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button size="lg" onClick={capturePhoto}>
                    <Camera className="w-5 h-5 mr-2" />
                    Chụp ({angleConfig[currentAngle].label})
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 3 Angle Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(['front', 'left', 'right'] as const).map((angle) => {
              const image = getImageByAngle(angle);
              return (
                <div key={angle} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{angleConfig[angle].label}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{angleConfig[angle].description}</p>

                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-3">
                    {image ? (
                      <img src={image.previewUrl} alt={angle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">Chưa có ảnh</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(angle, e)}
                      />
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-1" />
                          Tải lên
                        </span>
                      </Button>
                    </label>
                    {image && (
                      <Button variant="destructive" size="sm" onClick={() => removeImage(image.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRegister}
              disabled={capturedImages.length < 3 || isUploading}
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Gửi đăng ký ({capturedImages.length}/3 ảnh)
                </>
              )}
            </Button>
            {capturedImages.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  capturedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                  setCapturedImages([]);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Xóa tất cả
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lịch sử đăng ký</CardTitle>
          <Button variant="outline" size="sm" onClick={loadHistory} disabled={isLoadingHistory}>
            <RotateCcw className={`w-4 h-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : registrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có lịch sử đăng ký</p>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={reg.imageUrl ? getFileUrl(reg.imageUrl) : '/placeholder-face.jpg'}
                    alt="Face"
                    className="w-16 h-16 rounded-lg object-cover bg-muted"
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      Đăng ký ngày {new Date(reg.createdAt || '').toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Model: {reg.modelVersion || 'N/A'}
                      {reg.angle && ` · Góc: ${reg.angle === 'front' ? 'Trực diện' : reg.angle === 'left' ? 'Nghiêng trái' : 'Nghiêng phải'}`}
                    </p>
                  </div>
                  <Badge variant={reg.active ? 'default' : 'secondary'}>
                    {reg.active ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Đã duyệt
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Chờ duyệt
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}