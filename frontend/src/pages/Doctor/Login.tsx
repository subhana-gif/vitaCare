import React from "react";
import { useNavigate } from "react-router-dom";
import { doctorService } from "../../services/doctorService";
import CommonLogin from "../../components/common/login";
import { setAuth } from "../../redux/slices/doctorSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";


const DoctorLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await doctorService.login(email, password);
      const { token, doctor } = response;
      console.log("token in doctor login:",token)
      const status = doctor?.status;  // ✅ Extract `status` from the `doctor` object
  
      if (token && doctor) {
        dispatch(setAuth({ token, doctorId: doctor._id, status }));
        navigate("/doctor/profile"); // ✅ Redirect to profile if logged in successfully
      }
    } catch (error) {
      console.error("Doctor Login Error:", error);
      toast.error("Invalid credentials or account not approved.");
    }
  };
            

  return (
    <CommonLogin
      role="doctor"
      onSubmit={handleLogin}
      signupLink="/doctors/signup" // Custom signup link
      forgotPasswordLink="/doctor/forgot-password" // Custom forgot password link
    />
  );
};

export default DoctorLogin;