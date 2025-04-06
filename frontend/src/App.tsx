import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AdminRoutes from "../src/routes/adminRoutes";
import DoctorRoutes from "../src/routes/doctorRoutes";
import UserRoutes from "../src/routes/userRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App: React.FC = () => {
  return (
    <Router>
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <UserRoutes />
        <DoctorRoutes />
        <AdminRoutes />
      </>
    </Router>
  );
};

export default App;
