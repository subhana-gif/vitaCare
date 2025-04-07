import { ReactNode, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { checkBlocked, logout } from "../../redux/slices/authSlice";
import {userService} from "../../services/userService"
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
      if(!token)return
      try {
        const response = await userService.getProfile(token); 
        if (response.isBlocked) {
          dispatch(checkBlocked());
          dispatch(logout()); 
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
