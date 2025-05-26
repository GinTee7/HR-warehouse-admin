import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-slate-800">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mt-4">
          Trang không tồn tại
        </h2>
        <p className="text-slate-500 mt-2 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate(-1)}>Quay lại trang trước</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
