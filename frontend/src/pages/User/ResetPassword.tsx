import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/userService";
const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
  
    try {
      const requestData = {
        token: token as string, 
        password: newPassword 
      };
      console.log('Sending request with data:', requestData);
  
      const data = await userService.resetPassword(requestData);
  
      console.log('Response received:', data);
  
      if (data && data.message) {
        setMessage(data.message);
        setMessageType("success");
  
        let seconds = 3;
        setMessage(`${data.message} Redirecting to login in ${seconds} seconds...`);
  
        const countdownInterval = setInterval(() => {
          seconds -= 1;
          setMessage(`${data.message} Redirecting to login in ${seconds} seconds...`);
  
          if (seconds <= 0) {
            clearInterval(countdownInterval);
            navigate("/login");
          }
        }, 1000);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-center">
            <svg className="mx-auto w-16 h-16 text-white mb-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <h2 className="text-3xl font-bold text-white">Reset patient Password</h2>
          </div>
          
          <div className="p-8">
            <p className="text-gray-600 text-lg text-center mb-6">
              Create a new password for your VitaCare account
            </p>
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="password">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Password must be at least 8 characters</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 border border-gray-300 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Reset Password'}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password? <Link to="/login" className="text-blue-600 font-medium hover:underline">Back to Login</Link>
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-gray-500 text-center text-sm">
              For security reasons, this link will expire in 24 hours
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center justify-center">
          💙 VitaCare
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
