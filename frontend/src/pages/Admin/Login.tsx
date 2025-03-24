import React from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminSevice";
import CommonLogin from "../../components/common/login";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const { token } = await adminService.login(email, password);
      localStorage.setItem("adminToken", token);
      console.log("set admin token:",token)
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin Login Error:", error);
      throw error; // `CommonLogin` will handle showing errors
    }
  };

  return (
    <CommonLogin
      role="admin"
      onSubmit={handleLogin}
      showSignup={false} // Hide "Create Account"
      showForgotPassword={false} // Hide "Forgot Password"
    />
  );
};

export default AdminLogin;