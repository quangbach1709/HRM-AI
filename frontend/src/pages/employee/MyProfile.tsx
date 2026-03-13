import { useState, useRef } from 'react';
import { User, Mail, Phone, Building2, Calendar, Lock, Edit, Save, X, Camera } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/userApi';
import { personApi } from '@/services/personApi';
import { getFileUrl } from '@/services/fileApi';
import { UserFormData } from '@/types/user';
import { genderOptions } from '@/types/person';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function MyProfile() {
  const { user, staff, person, refreshUserData } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    displayName: person?.displayName || '',
    phoneNumber: person?.phoneNumber || '',
    birthDate: person?.birthDate ? person.birthDate.split('T')[0] : '',
    gender: person?.gender ?? 0,
    email: person?.email || user?.email || '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setIsLoading(true);
      const data: UserFormData = {
        id: user.id,
        username: user.name,
        email: user.email,
        password: passwords.new,
        confirmPassword: passwords.confirm
      };
      await userApi.updatePassword(data);
      toast.success('Đổi mật khẩu thành công!');
      setIsEditingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);
      await personApi.updateCurrentProfile({
        displayName: profileForm.displayName,
        phoneNumber: profileForm.phoneNumber,
        birthDate: profileForm.birthDate || undefined,
        gender: profileForm.gender,
        email: profileForm.email,
      });
      toast.success('Cập nhật thông tin thành công!');
      setIsEditingProfile(false);
      // Refresh user data in context
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    try {
      setIsLoading(true);
      await personApi.uploadAvatar(file);
      toast.success('Cập nhật ảnh đại diện thành công!');
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload ảnh thất bại');
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getGenderLabel = (gender?: number) => {
    switch (gender) {
      case 0: return 'Nam';
      case 1: return 'Nữ';
      case 2: return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };

  const avatarUrl = person?.avatar ? getFileUrl(person.avatar) : null;

  const profileFields = [
    { label: 'Họ và tên', value: person?.displayName || user?.name, icon: User, key: 'displayName' },
    { label: 'Email', value: user?.email || person?.email, icon: Mail, key: 'email' },
    { label: 'Số điện thoại', value: person?.phoneNumber || 'Chưa cập nhật', icon: Phone, key: 'phoneNumber' },
    { label: 'Giới tính', value: getGenderLabel(person?.gender), icon: User, key: 'gender' },
    { label: 'Ngày sinh', value: formatDate(person?.birthDate), icon: Calendar, key: 'birthDate' },
    { label: 'Phòng ban', value: user?.department || 'Chưa phân công', icon: Building2, key: 'department', readonly: true },
    { label: 'Ngày vào làm', value: formatDate(staff?.startDate || staff?.recruitmentDate), icon: Calendar, key: 'startDate', readonly: true },
  ];

  return (
    <div>
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Xem và quản lý thông tin cá nhân"
      />

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                ) : null}
                <AvatarFallback className="bg-employee text-employee-foreground text-2xl">
                  {user?.avatar}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{person?.displayName || user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Phòng {user?.department || 'Kỹ thuật'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-employee" />
              Thông tin cá nhân
            </CardTitle>
            {!isEditingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProfileForm({
                    displayName: person?.displayName || '',
                    phoneNumber: person?.phoneNumber || '',
                    birthDate: person?.birthDate ? person.birthDate.split('T')[0] : '',
                    gender: person?.gender ?? 0,
                    email: person?.email || user?.email || '',
                  });
                  setIsEditingProfile(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={String(profileForm.gender)}
                    onValueChange={(value) => setProfileForm({ ...profileForm, gender: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProfileSave} className="flex-1" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setIsEditingProfile(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profileFields.map((field, index) => {
                const Icon = field.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg bg-employee/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-employee" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{field.label}</p>
                      <p className="font-medium truncate">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-employee" />
              Đổi mật khẩu
            </CardTitle>
            {!isEditingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPassword(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Đổi
              </Button>
            )}
          </div>
        </CardHeader>
        {isEditingPassword && (
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} className="flex-1" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
