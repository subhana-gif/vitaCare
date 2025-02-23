import DoctorSidebar from "./Sidebar";
import DoctorNavbar from "./Navbar";
import { Outlet } from "react-router-dom";

const DoctorLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar at the Top */}
      <DoctorNavbar />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Fixed height sidebar with overflow handling */}
        <div className="w-1/5 bg-indigo-500 flex-shrink-0">
          <div className="sticky top-0">
            <DoctorSidebar />
          </div>
        </div>
        
        {/* Main content area with scroll */}
        <div className="w-4/5 bg-gray-50 p-5 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;