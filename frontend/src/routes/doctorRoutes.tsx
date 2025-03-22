import React from "react";
import { Routes, Route } from "react-router-dom";
import SetPassword from "../pages/Admin/SetPassword";
import DoctorLogin from "../pages/Doctor/Login";
import DoctorLayout from "../components/Doctor/layout";
import DoctorDashboard from "../pages/Doctor/Dashboard";
import DoctorAppointments from "../pages/Doctor/Appointments";
import DoctorProfile from "../pages/Doctor/Profile";
import DoctorForgotPassword from "../pages/Doctor/DoctorForgetPassword";
import DoctorResetPassword from "../pages/Doctor/DoctorResetPassword";
import ProtectedDoctorRoute from "../pages/Doctor/ProtectedDoctorRoute";
import SlotManagement from "../pages/Doctor/slot";
import Chat from "../pages/Doctor/doctorchat";
import Reviews from "../pages/Doctor/Reviews"

const DoctorRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/doctors/set-password/:token" element={<SetPassword />} />
      <Route path="/doctor/forgot-password" element={<DoctorForgotPassword />} />
      <Route path="/doctor/resetPassword/:token" element={<DoctorResetPassword />} />

      {/* Protected routes for approved and non-approved doctors */}
      <Route element={<ProtectedDoctorRoute />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="appointments" element={<><ProtectedDoctorRoute restricted /><DoctorAppointments /></>} />
          <Route path="dashboard" element={<><ProtectedDoctorRoute restricted /><DoctorDashboard /></>} />
          <Route path="slot" element={<><ProtectedDoctorRoute restricted /><SlotManagement /></>} />
          <Route path="chat" element={<><ProtectedDoctorRoute restricted /><Chat/></>} />
          <Route path="reviews" element={<><ProtectedDoctorRoute restricted /><Reviews/></>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default DoctorRoutes;
