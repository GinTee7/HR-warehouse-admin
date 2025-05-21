import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  allowedRoles: number[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();

  // Get role from localStorage or localStorage
  const sessionRole = localStorage.getItem("Role");
  const localRole = localStorage.getItem("Role");
  const userRole = sessionRole || localRole;
  // Check if user is authenticated and has the required role
  const isAuthorized =
    userRole !== null && allowedRoles.includes(Number(userRole));

  if (!isAuthorized) {
    // If user is logged in but doesn't have the correct role, show error message
    if (userRole !== null) {
      toast.error("Tài khoản của bạn không được phép vào hệ thống");
    }

    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
