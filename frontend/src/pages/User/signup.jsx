import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { email });
      setMessage(res.data.message);
      setStep(2); // Move to OTP step
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP");
    }
  };

  const resendOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resending OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
  
      if (res.data.success) {
        // ✅ Step 1: OTP Verified, Now Register the User
        const signupRes = await axios.post("http://localhost:5000/api/auth/signup", {
          name,
          email,
          password,
        });
  
        setMessage(signupRes.data.message);
  
        if (signupRes.data.success) {
          navigate("/home"); // Redirect after successful signup
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error verifying OTP");
    }
  };
  
  return (
    <div>
      <h2>Signup</h2>
      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP}>Verify OTP</button>
          <button onClick={resendOTP}>Resend OTP</button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
