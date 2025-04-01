"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Lock,
  User,
  Package,
  BarChart3,
  Warehouse,
  ShieldCheck,
  Truck,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import authService from "@/services/auth-service";
import { Checkbox } from "@/components/ui/checkbox";
import { jwtDecode } from "jwt-decode";
import { cn } from "@/lib/utils";

// Form schema for validation
const formSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const sessionRole = sessionStorage.getItem("Role");
    const localRole = localStorage.getItem("Role");
    const userRole = sessionRole || localRole;

    if (userRole) {
      const roleNumber = Number(userRole);
      // Redirect to appropriate dashboard based on role
      if (roleNumber === 1) {
        navigate("/admin");
      } else if (roleNumber === 4) {
        navigate("/warehouse");
      } else if (roleNumber === 5) {
        navigate("/accountant");
      }
    }
  }, [navigate]);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.username, data.password);
      const token = response.token.token;

      // Decode token
      const decoded: any = jwtDecode(token);
      const userId =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      // Store token and role
      if (data.rememberMe) {
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);
        localStorage.setItem("Role", response.token.roleId.toString());
      } else {
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("Role", response.token.roleId.toString());
      }

      // Redirect
      if (response.token.roleId === 1) {
        toast.success("Đăng nhập thành công");
        navigate("/admin");
      } else if (response.token.roleId === 3) {
        toast.success("Đăng nhập thành công");
        navigate("/warehouse");
      } else if (response.token.roleId === 5) {
        toast.success("Đăng nhập thành công");
        navigate("/accountant");
      } else {
        toast.error("Tài khoản của bạn không được phép vào hệ thống");
        if (data.rememberMe) {
          localStorage.removeItem("token");
          localStorage.removeItem("Role");
        } else {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("Role");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/warehouse-bg.jpg')] bg-cover bg-center bg-fixed"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90 backdrop-blur-sm"></div>
      </div>

      {/* Animated elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-blue-500/10 blur-3xl animate-float-slow"></div>
        <div className="absolute top-[30%] right-[10%] w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl animate-float-medium"></div>
        <div className="absolute bottom-[15%] left-[15%] w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl animate-float-fast"></div>

        {/* Light rays */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40vh] bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl transform -rotate-12 origin-top"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[30vh] bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl transform rotate-12 origin-top"></div>

        {/* Floating icons */}
        <div className="absolute top-20 left-[10%] text-blue-400/20 animate-float-slow">
          <Package size={48} />
        </div>
        <div className="absolute top-40 right-[15%] text-indigo-400/20 animate-float-medium">
          <Truck size={56} />
        </div>
        <div className="absolute bottom-20 left-[20%] text-cyan-400/20 animate-float-fast">
          <ClipboardCheck size={40} />
        </div>
        <div className="absolute bottom-40 right-[25%] text-blue-400/20 animate-float-slow">
          <Warehouse size={52} />
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "w-full max-w-6xl z-10 flex flex-col lg:flex-row rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-1000 overflow-hidden",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {/* Left side - Branding */}
        <div className="lg:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                  />
                </pattern>
                <linearGradient
                  id="fadeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              <rect width="100" height="100" fill="url(#fadeGradient)" />
            </svg>
          </div>

          {/* Glowing circle */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/30 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-400/30 blur-3xl"></div>

          <div className="relative z-10">
            <div
              className={cn(
                "flex items-center space-x-3 mb-10 transition-all duration-1000",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <div className="p-2.5 bg-white/20 rounded-xl shadow-lg">
                <Warehouse className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                WarehouseManager
              </h1>
            </div>

            <h2
              className={cn(
                "text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 leading-tight transition-all duration-1000 delay-300",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              Hệ thống quản lý kho{" "}
              <span className="text-cyan-300">thông minh</span>
            </h2>

            <p
              className={cn(
                "text-white/80 text-lg mb-10 max-w-md transition-all duration-1000 delay-500",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              Giải pháp toàn diện giúp tối ưu hóa quy trình quản lý kho, theo
              dõi hàng tồn và nâng cao hiệu quả vận hành.
            </p>
          </div>

          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 transition-all duration-1000 delay-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 bg-white/10 rounded-lg mt-1 group-hover:bg-white/20 transition-colors duration-300">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Quản lý hàng tồn</h3>
                <p className="text-white/70 text-sm">
                  Theo dõi số lượng và vị trí hàng hóa
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 bg-white/10 rounded-lg mt-1 group-hover:bg-white/20 transition-colors duration-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Báo cáo thống kê</h3>
                <p className="text-white/70 text-sm">
                  Phân tích dữ liệu và tạo báo cáo
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 bg-white/10 rounded-lg mt-1 group-hover:bg-white/20 transition-colors duration-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Bảo mật</h3>
                <p className="text-white/70 text-sm">Bảo mật tuyệt đối</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 bg-white/10 rounded-lg mt-1 group-hover:bg-white/20 transition-colors duration-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Xuất nhập kho</h3>
                <p className="text-white/70 text-sm">
                  Quản lý quy trình xuất nhập kho
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center bg-white/10 backdrop-blur-lg">
          <div className="w-full max-w-md mx-auto">
            <div
              className={cn(
                "mb-8 transition-all duration-1000 delay-300",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <h2 className="text-2xl font-bold text-white">Đăng nhập</h2>
              <p className="text-blue-100/80 mt-2">
                Nhập thông tin đăng nhập của bạn để tiếp tục
              </p>
            </div>

            <Card
              className={cn(
                "border-0 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] bg-white/10 backdrop-blur-xl transition-all duration-1000 delay-500 text-white",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">
                            Tên đăng nhập
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/40 to-indigo-400/40 rounded-md blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-white/10 rounded-md border border-white/20 overflow-hidden">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200 group-hover:text-blue-100 transition-colors" />
                                <Input
                                  placeholder="Nhập tên đăng nhập"
                                  className="pl-10 border-0 bg-transparent text-white placeholder:text-blue-200/50 focus-visible:ring-blue-400/50 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100">
                            Mật khẩu
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/40 to-indigo-400/40 rounded-md blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                              <div className="relative bg-white/10 rounded-md border border-white/20 overflow-hidden">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200 group-hover:text-blue-100 transition-colors" />
                                <Input
                                  type="password"
                                  placeholder="Nhập mật khẩu"
                                  className="pl-10 border-0 bg-transparent text-white placeholder:text-blue-200/50 focus-visible:ring-blue-400/50 focus-visible:ring-offset-0"
                                  {...field}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer text-blue-100">
                            Ghi nhớ đăng nhập
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-md blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
                        <Button
                          type="submit"
                          className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2.5 border-0"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang đăng nhập...
                            </>
                          ) : (
                            "Đăng nhập"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div
              className={cn(
                "mt-8 text-center transition-all duration-1000 delay-700",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <p className="text-sm text-blue-100/70">
                © {new Date().getFullYear()} WarehouseManager. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
