import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/User/signup";
import Login from "./pages/User/Login";
import Home from "./pages/User/Home";
import AdminLogin from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import Layout from "./components/Admin/Layout";
import Appointments from "./pages/Admin/Appointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import SetPassword from "./pages/Admin/SetPassword";
import DoctorLogin from "./pages/Doctor/Login";
import DoctorLayout from "./components/Doctor/layout";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorAppointments from "./pages/Doctor/Appointments"
import DoctorProfile from "./pages/Doctor/Profile";
import AllDoctors from "./pages/User/AllDoctors"
import About from "./pages/User/About";
import Contact from "./pages/User/Contact";
import LayoutUser from "./components/User/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<LayoutUser />}>
          <Route index element={<Home />} />
          <Route path="doctors" element={<AllDoctors />} />
          <Route path="About" element={<About/>}/>
          <Route path="contact" element={<Contact/>}/>
        </Route>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="doctors-list" element={<DoctorsList />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctors/set-password" element={<SetPassword />} />
        <Route path="/doctors/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="profile" element={<DoctorProfile />} />  
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
