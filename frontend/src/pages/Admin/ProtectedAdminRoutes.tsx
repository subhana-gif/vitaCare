import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const adminToken: string | null = localStorage.getItem("adminToken");
  return adminToken ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
