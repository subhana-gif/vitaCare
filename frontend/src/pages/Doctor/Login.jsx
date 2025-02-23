import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/doctors/login", {
        email,
        password,
      });
  
      if (response.data.token) {
        localStorage.setItem("doctorToken", response.data.token);
        toast.success("Login Successful!");
        setTimeout(() => {
          navigate("/doctor/dashboard");  // Redirect after storing token
        }, 1000);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      toast.error(error.response?.data?.error || "Invalid credentials");
    }
  };
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-xl font-bold mb-4">Doctor Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded w-full mb-3"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded w-full mb-3"
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default DoctorLogin;
