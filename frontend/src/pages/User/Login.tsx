import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { setUser, setAccessToken } from "../../redux/slices/authSlice";
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
      throw error; // Throw error to be handled by CommonLogin
    }
  };

  return <CommonLogin role="user" onSubmit={handleLogin} />;
};

export default UserLogin;