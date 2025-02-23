import { IoLogOutOutline } from "react-icons/io5";

const DoctorNavbar = () => {
  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">♡ VitaCare</h1>  
      <button className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
        <IoLogOutOutline className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default DoctorNavbar;
