import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const adminToken: string | null = localStorage.getItem("adminToken");
  return adminToken ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
