import DoctorSidebar from "./Sidebar";
import DoctorNavbar from "./Navbar";
import { Outlet } from "react-router-dom";
import ProtectedDoctorRoute from "../../pages/Doctor/ProtectedDoctorRoute"
import React from "react";

const DoctorLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <DoctorNavbar />

      <div className="flex flex-1">
        <div className="w-1/5 bg-indigo-500 flex-shrink-0">
          <div className="sticky top-0">
            <DoctorSidebar />
          </div>
        </div>
        
        <div className="w-4/5 bg-gray-50 p-5 overflow-auto">
        <ProtectedDoctorRoute>
        <Outlet />
        </ProtectedDoctorRoute>
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;