import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { setUser, setAccessToken } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import CommonLogin from "../../components/common/login";

const UserLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const res = await userService.login(email, password);
      console.log(res);

      if (res) {
        dispatch(setAccessToken(res.token));
        dispatch(setUser(res.user));

        // Optional: Use `rememberMe` to store token in localStorage or sessionStorage
        if (rememberMe) {
          localStorage.setItem("userToken", res.token); // Persistent login
        } else {
          sessionStorage.setItem("userToken", res.token); // Session-based login
        }

        navigate("/");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error("Invalid credentials.",error);
    }
  };
  return (
    <div>
      <CommonLogin role="user" onSubmit={handleLogin} />
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
    <button onClick={() => navigate("/admin/login")}>Admin Login</button>
    <button onClick={() => navigate("/doctors/login")}>Doctor Login</button>
  </div>
</div>    
</div>
  );
};

export default UserLogin;