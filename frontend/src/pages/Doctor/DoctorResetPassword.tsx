import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import React from "react";
import { doctorService } from "../../services/doctorService";

const DoctorResetPassword: React.FC = () => {
  const { token } = useParams<{ token?: string }>();  
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const navigate = useNavigate();

  const checkPasswordStrength = (password: string) => {
    const strength = password.length >= 6 ? 1 : 0;
    setPasswordStrength(strength);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await doctorService.resetPassword(token, newPassword);
      console.log(response)
      setTimeout(() => navigate("/doctors/login"), 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to reset password");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
            <span className="text-blue-600">💙 VitaCare</span>
          </h2>
          <p className="mt-2 text-xl font-medium text-blue-600">Reset Doctor Password</p>
          <p className="text-md text-gray-500">Create a new secure password for your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-md font-medium text-gray-700">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="appearance-none mt-1 relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a strong password"
              />
              {newPassword && (
                <div className="mt-2">
                  <p className="text-2xl text-gray-500 mt-1">Password should have 6 characters.</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-md font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none mt-1 relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-2xl text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || passwordStrength === 0}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-md font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-md">
            Remember your password? <Link to="/doctors/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorResetPassword;
