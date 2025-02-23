import { NavLink } from "react-router-dom";

const DoctorSidebar = () => {
  return (
    <div className="text-white p-5 h-full">
      <ul className="space-y-5">
        <li>
          <NavLink 
            to="/doctor/dashboard"
            end  
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/dashboard/appointments"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Appointments
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/dashboard/profile"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default DoctorSidebar; 