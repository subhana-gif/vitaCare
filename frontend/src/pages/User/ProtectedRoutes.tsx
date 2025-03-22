import { ReactNode, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { checkBlocked, logout } from "../../redux/slices/authSlice";
import axios from "axios"; // For real-time user status check
import React from "react";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState)=>state.auth.accessToken)
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.isBlocked) {
          dispatch(checkBlocked());
          dispatch(logout());  // Ensure session is cleared
        }
      } catch (error) {
        console.error("Failed to verify user status:", error);
      }
    };

    if (user) {
      checkUserStatus();
    }
  }, [user, dispatch]);

  if (!user || user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
