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
            to="/doctor/appointments"
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
            to="/doctor/chat"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            chat
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/reviews"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Reviews & Ratings
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/slot"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Slot Management
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/doctor/profile"
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