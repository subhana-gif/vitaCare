import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import PrescriptionView from "../components/Prescription/PrescriptionView";
import About from "../pages/User/About"
import Contact from "../pages/User/Contact"
import GeminiChat from "../pages/User/geminiChat"
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";


const UserRoutes: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);


  return (
    <Routes>
      <Route path="/doctors/login" element={<DoctorLogin />} />
      <Route path="/doctors/signup" element={<DoctorSignup />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/" element={<LayoutUser />}>
        <Route index element={<Home />} />
        <Route path="doctors/:id" element={<DoctorDetails />} />
        <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="geminiChat" element={<ProtectedRoute><GeminiChat/></ProtectedRoute>} />
        <Route path="doctors" element={<AllDoctors />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="doctors/:specialty" element={<AllDoctors />} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="myAppointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="chats/:userId?/:doctorId?"element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
        <Route path="prescription/:appointmentId" element={<ProtectedRoute><PrescriptionView /></ProtectedRoute>} />
        
        </Route>
    </Routes>
  );
};

export default UserRoutes;
