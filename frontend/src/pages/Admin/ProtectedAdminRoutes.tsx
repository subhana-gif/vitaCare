import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute: React.FC = () => {
  const adminToken: string | null = localStorage.getItem("adminToken");
  return adminToken ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedAdminRoute;
