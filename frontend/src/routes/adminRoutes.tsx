import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/Admin/Login";
import Dashboard from "../pages/Admin/Dashboard";
import Layout from "../components/Admin/Layout";
import Appointments from "../pages/Admin/Appointments";
import AddDoctor from "../pages/Admin/AddDoctor";
import DoctorsList from "../pages/Admin/DoctorsList";
import AdminUserManagement from "../pages/Admin/UserManagement";
import ProtectedAdminRoute from "../pages/Admin/ProtectedAdminRoutes";
import RejectedDoctors from "../pages/Admin/Rejected";
import SpecialityManagement from "../pages/Admin/specialityManage";

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedAdminRoute children={undefined} />}>
        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user-management" element={<AdminUserManagement />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="speciality" element={<SpecialityManagement />} />
          <Route path="doctors-list" element={<DoctorsList />} />
          <Route path="rejected-doctors" element={<RejectedDoctors/>}/>
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
