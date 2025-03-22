import React, { useState } from "react";
import {userService} from "../../services/userService"
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
  
    try {
      const data = await userService.forgotPassword(email); 
      console.log("data:", data);  // ✅ Now data will hold the correct response
      setMessage(data.message || "Check your email for reset instructions.");
      setMessageType("success");
      setEmail(""); 
    } catch (error: any) {
      console.error("Error:", error);
      setMessage(error.response?.data?.message || "Something went wrong");
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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h2 className="text-3xl font-bold text-white">Forgot Password?</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-600 text-lg text-center mb-6">
              Don't worry! Enter your email address and we'll send you instructions to reset your password.
            </p>
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
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
              If you need assistance, please contact support at <span className="text-blue-600">support@vitaCare.com</span>
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

export default ForgotPassword;
