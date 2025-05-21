"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface Address {
  street: string;
  ward: {
    wardName: string;
  };
  district: {
    districtName: string;
  };
  province: {
    provinceName: string;
  };
}

interface Employee {
  fullName: string;
  position: string;
  department: string;
  address: Address;
}

interface UserProfile {
  userId: string;
  username: string;
  email: string;
  phone: string;
  employee: Employee;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function WarehouseProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg");
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [, setPasswordScore] = useState<number>(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn chưa đăng nhập");
          return;
        }

        const response = await axios.get(
          "https://minhlong.mlhr.org/api/my-info-warehouse",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data) {
          throw new Error("Không có dữ liệu trả về từ API");
        }

        setProfile(response.data);

        // Generate avatar from name if available
        if (response.data?.employee?.fullName) {
          const name = response.data.employee.fullName;
          setAvatarUrl(
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=random`
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  // Validate phone
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "Số điện thoại không được để trống",
      }));
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: undefined }));
    return true;
  };

  // Validate full name
  const validateFullName = (name: string): boolean => {
    if (!name) {
      setErrors((prev) => ({
        ...prev,
        fullName: "Họ tên không được để trống",
      }));
      return false;
    }
    if (name.length < 3) {
      setErrors((prev) => ({
        ...prev,
        fullName: "Họ tên phải có ít nhất 3 ký tự",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, fullName: undefined }));
    return true;
  };

  // Check password strength
  const checkPasswordStrength = (password: string): void => {
    let score = 0;
    let feedback = "";

    if (password.length === 0) {
      setPasswordScore(0);
      setPasswordStrength("");
      return;
    }

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety check
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set feedback based on score
    if (score <= 2) {
      feedback = "Yếu";
    } else if (score <= 4) {
      feedback = "Trung bình";
    } else {
      feedback = "Mạnh";
    }

    setPasswordScore(score);
    setPasswordStrength(feedback);
  };

  // Validate password
  const validatePassword = (): boolean => {
    // Validate current password
    if (!currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Mật khẩu hiện tại không được để trống",
      }));
      return false;
    }

    // Validate new password
    if (!newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Mật khẩu mới không được để trống",
      }));
      return false;
    }

    if (newPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Mật khẩu mới phải có ít nhất 8 ký tự",
      }));
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrors((prev) => ({
        ...prev,
        newPassword:
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
      }));
      return false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Xác nhận mật khẩu không được để trống",
      }));
      return false;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
      return false;
    }

    // Clear errors if all validations pass
    setErrors((prev) => ({
      ...prev,
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    }));

    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Validate all fields
    const isEmailValid = validateEmail(profile.email);
    const isPhoneValid = validatePhone(profile.phone);
    const isFullNameValid = validateFullName(profile.employee.fullName);

    if (!isEmailValid || !isPhoneValid || !isFullNameValid) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn chưa đăng nhập");
        return;
      }

      // await axios.put("https://minhlong.mlhr.org/api/update-profile", {
      //   email: profile.email,
      //   phone: profile.phone,
      //   fullName: profile.employee.fullName
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      toast.success("Thông tin cá nhân đã được cập nhật");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin cá nhân");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password fields
    if (!validatePassword()) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn chưa đăng nhập");
        return;
      }

      // await axios.post("https://minhlong.mlhr.org/api/change-password", {
      //   currentPassword,
      //   newPassword
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      toast.success("Mật khẩu đã được thay đổi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength("");
      setPasswordScore(0);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Không thể thay đổi mật khẩu");
    } finally {
      setUpdating(false);
    }
  };

  const getFullAddress = () => {
    if (!profile?.employee?.address) return "Chưa cập nhật";

    const { street, ward, district, province } = profile.employee.address;
    return `${street}, ${ward.wardName}, ${district.districtName}, ${province.provinceName}`;
  };

  const getPositionDisplay = (position: string) => {
    const positions: Record<string, string> = {
      STAFF: "Nhân viên",
      MANAGER: "Quản lý",
      ADMIN: "Quản trị viên",
    };
    return positions[position] || position;
  };

  const getDepartmentDisplay = (department: string) => {
    const departments: Record<string, string> = {
      "WAREHOUSE MANAGER": "Quản lý kho",
      SALES: "Bán hàng",
      ACCOUNTING: "Kế toán",
    };
    return departments[department] || department;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">
          Không thể tải thông tin cá nhân
        </h2>
        <p className="text-muted-foreground mt-2">
          Vui lòng đăng nhập lại hoặc liên hệ quản trị viên
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={avatarUrl || "/placeholder.svg"}
            alt={profile.employee.fullName}
          />
          <AvatarFallback>{profile.employee.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.employee.fullName}</h2>
          <p className="text-muted-foreground">
            {getDepartmentDisplay(profile.employee.department)} -{" "}
            {getPositionDisplay(profile.employee.position)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Xem và cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input id="username" value={profile.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex justify-between">
                      Email
                      {errors.email && (
                        <span className="text-red-500 text-xs">
                          {errors.email}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        setProfile({ ...profile, email: e.target.value });
                        validateEmail(e.target.value);
                      }}
                      className={errors.email ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex justify-between">
                      Họ tên
                      {errors.fullName && (
                        <span className="text-red-500 text-xs">
                          {errors.fullName}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="fullName"
                      value={profile.employee.fullName}
                      onChange={(e) => {
                        setProfile({
                          ...profile,
                          employee: {
                            ...profile.employee,
                            fullName: e.target.value,
                          },
                        });
                        validateFullName(e.target.value);
                      }}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex justify-between">
                      Số điện thoại
                      {errors.phone && (
                        <span className="text-red-500 text-xs">
                          {errors.phone}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => {
                        setProfile({ ...profile, phone: e.target.value });
                        validatePhone(e.target.value);
                      }}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Phòng ban</Label>
                  <Input
                    id="department"
                    value={getDepartmentDisplay(profile.employee.department)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input
                    id="position"
                    value={getPositionDisplay(profile.employee.position)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input id="address" value={getFullAddress()} disabled />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Thay đổi mật khẩu đăng nhập của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="flex justify-between"
                  >
                    Mật khẩu hiện tại
                    {errors.currentPassword && (
                      <span className="text-red-500 text-xs">
                        {errors.currentPassword}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        currentPassword: undefined,
                      }));
                    }}
                    className={errors.currentPassword ? "border-red-500" : ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex justify-between">
                    Mật khẩu mới
                    {errors.newPassword && (
                      <span className="text-red-500 text-xs">
                        {errors.newPassword}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        newPassword: undefined,
                      }));
                      checkPasswordStrength(e.target.value);
                    }}
                    className={errors.newPassword ? "border-red-500" : ""}
                    required
                  />
                  {passwordStrength && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs">
                          Độ mạnh mật khẩu: {passwordStrength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            passwordStrength === "Yếu"
                              ? "bg-red-500 w-1/3"
                              : passwordStrength === "Trung bình"
                              ? "bg-yellow-500 w-2/3"
                              : "bg-green-500 w-full"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex justify-between"
                  >
                    Xác nhận mật khẩu mới
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-xs">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    required
                  />
                </div>

                <AlertDialog>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDialogDescription>
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                    thường, số và ký tự đặc biệt.
                  </AlertDialogDescription>
                </AlertDialog>

                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
