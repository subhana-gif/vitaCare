import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "../pages/User/signup";
import Login from "../pages/User/Login";
import Home from "../pages/User/Home";
import LayoutUser from "../components/User/Layout";
import Profile from "../pages/User/Profile";
import AllDoctors from "../pages/User/AllDoctors";
import DoctorDetails from "../pages/User/DoctorDetails";
import MyAppointments from "../pages/User/MyAppointments";
import Chat from "../pages/User/Chat";
import ForgotPassword from "../pages/User/ForgetPassword";
import ResetPassword from "../pages/User/ResetPassword";
import ProtectedRoute from "../pages/User/ProtectedRoutes";
import DoctorLogin from "../pages/Doctor/Login";
import DoctorSignup from "../pages/Doctor/signup";
import Chats from "../pages/Common/chat";


const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/doctors/login" element={<DoctorLogin />} />
      <Route path="/doctors/signup" element={<DoctorSignup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<LayoutUser />}>
        <Route index element={<Home />} />
        <Route path="doctors/:id" element={<DoctorDetails />} />
        <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="doctors" element={<AllDoctors />} />
        <Route path="doctors/:specialty" element={<AllDoctors />} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="myAppointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="chats/:userId?/:doctorId?"element={<ProtectedRoute><Chats /></ProtectedRoute>}/>
      </Route>
    </Routes>
  );
};

export default UserRoutes;
