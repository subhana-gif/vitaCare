import React from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminSevice";
import CommonLogin from "../../components/common/login";
import { toast } from "react-toastify";


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
      toast.error("Invalid credentials.");
    }
  };

  return (
    <div>
    <CommonLogin role="admin" onSubmit={handleLogin} showSignup={false} showForgotPassword={false}/>
    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
    <button onClick={() => navigate("/doctors/login")}>Doctor Login</button>
    <button onClick={() => navigate("/login")}>User Login</button>
    </div>
    </div>
  );
};

export default AdminLogin;