import { useState, FormEvent } from "react";
import { doctorService } from "../../services/doctorService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import * as yup from "yup";
import React from "react";

// Define the Yup validation schema
const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

const DoctorForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validate the form data
      await emailSchema.validate({ email }, { abortEarly: false });

      // Clear any existing errors
      setErrors({});

      // Proceed with sending the reset link
      setLoading(true);
      const response = await doctorService.forgotPassword(email);
      setSubmitted(true);
      toast.success(response || "Reset link sent successfully!");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Handle validation errors
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-7 text-3xl font-extrabold text-gray-900">
            <span className="text-blue-600">💙 VitaCare</span>
          </h2>
          <p className="mt-7 text-2xl font-medium text-blue-600">Password Recovery</p>
          <p className="text-lg text-gray-500">We'll send a reset link to your email</p>
        </div>

        {submitted ? (
          <div className="mt-9 text-center">
            <div className="rounded-full bg-green-100 p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-medium text-gray-900">Reset Link Sent</h3>
            <p className="mt-4 text-md text-gray-500">
              Please check your email inbox for instructions on how to reset your password.
            </p>
            <div className="mt-6">
              <Link to="/doctors/login" className="text-blue-600 font-medium hover:text-blue-500">
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-9 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="email-address" className="block text-lg font-medium text-gray-700">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none mt-1 relative block w-full px-3 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10`}
                placeholder="doctor@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <p className="mt-4 text-lg text-gray-500">
                Enter the email address associated with your doctor account
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Link...
                  </span>
                ) : (
                  "Send Password Reset Link"
                )}
              </button>
            </div>
            
            <div className="text-center text-xl">
              <Link to="/doctors/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </form>
        )}
        
        <div className="text-center text-lg text-gray-500 mt-4">
          <p>For security reasons, the reset link will expire after 30 minutes.</p>
          <p className="mt-4">Need help? <a href="#" className="text-blue-600 hover:text-blue-500">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default DoctorForgotPassword;