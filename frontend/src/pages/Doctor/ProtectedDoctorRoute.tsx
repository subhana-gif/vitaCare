import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom"; // ✅ Added `useNavigate`
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import axios from "axios";
import { logout } from "../../redux/slices/authSlice";
import { doctorService } from "../../services/doctorService";

interface ProtectedRouteProps {
  restricted?: boolean;
  children?: React.ReactNode;
}

const ProtectedDoctorRoute: React.FC<ProtectedRouteProps> = ({ restricted }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Added navigation hook

  const token = useSelector((state: RootState) => state.doctors.token);
  const doctorId = useSelector((state: RootState) => state.doctors.doctorId); 
  const status = useSelector((state: RootState) => state.doctors.status);

  useEffect(() => {
    if(!doctorId)return
    const checkDoctorStatus = async () => {
      try {
        const doctor = await doctorService.getDoctorById(doctorId);
        if (doctor?.isBlocked) {
          dispatch(logout());
          toast.error("Your account has been blocked by the admin.");
          
          // ✅ Navigate to login immediately after logout
          navigate("/doctors/login", { replace: true }); 
        }
      } catch (error) {
        console.error("Doctor status check failed:", error);
      }
    };

    if (token && doctorId) {
      checkDoctorStatus();
    }
  }, [token, doctorId, dispatch, navigate]); // ✅ Added `navigate` in dependency array

  if (!token) {
    return <Navigate to="/doctors/login" replace />;
  }

  if (restricted && status !== "approved") {
    toast.warn("Access denied: Your account is not yet approved.");
    return <Navigate to="/doctor/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedDoctorRoute;
