import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/doctors/set-password", {
        email,
        password,
      });
      toast.success(response.data.message);
      navigate("/doctors/login"); // Redirect to login after setting password
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-xl font-bold mb-4">Set Your Password</h2>
      <p>Email: {email}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded w-full mb-3"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="p-2 border rounded w-full mb-3"
        />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded">
          Set Password
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
