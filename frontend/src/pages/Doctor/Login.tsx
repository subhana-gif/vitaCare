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
    <div>
      <CommonLogin role="doctor" onSubmit={handleLogin} signupLink="/doctors/signup" forgotPasswordLink="/doctor/forgot-password" />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
        <button onClick={() => navigate("/admin/login")}>Admin Login</button>
        <button onClick={() => navigate("/login")}>User Login</button>
      </div>
      </div>    
      </div>
  );
};

export default DoctorLogin;