import React, { FC } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProtectedAdminRoute from "../../pages/Admin/ProtectedAdminRoutes";
import { Outlet } from "react-router-dom";

const Layout: FC = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar at the Top */}
      <Navbar />

      {/* Sidebar and Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar (Takes 1/5 Width) */}
        <Sidebar />

        {/* Main Content (Takes 4/5 Width) */}
        <div className="w-4/5 bg-gray-50 flex flex-col">
          <div className="p-5 flex-grow">
            <ProtectedAdminRoute>
              <Outlet />
            </ProtectedAdminRoute>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
