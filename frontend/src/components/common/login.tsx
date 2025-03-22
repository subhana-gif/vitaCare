import React, { useState, FormEvent } from "react";
import * as yup from "yup";

interface CommonLoginProps {
  role: "user" | "admin" | "doctor";
  onSubmit: (email: string, password: string, rememberMe: boolean) => void;
  showSignup?: boolean; // Optional prop to show/hide "Create Account" link
  showForgotPassword?: boolean; // Optional prop to show/hide "Forgot Password" link
  signupLink?: string; // Custom signup link
  forgotPasswordLink?: string; // Custom forgot password link
}

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const CommonLogin: React.FC<CommonLoginProps> = ({
  role,
  onSubmit,
  showSignup = true,
  showForgotPassword = true,
  signupLink = "/signup",
  forgotPasswordLink = "/forgot-password",
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [backendError, setBackendError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
      setErrors({});
      setBackendError(null);
      onSubmit(email, password, rememberMe);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else if (error instanceof Error) {
        setBackendError(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="flex w-full max-w-5xl bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Left Side */}
        <div className="md:block w-1/2 bg-blue-600 p-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">VitaCare</h1>
            <div className="mb-8">
              <div className="text-9xl py-24">🤍</div>
            </div>
            <p className="text-white text-xl">Your health is our priority</p>
            <p className="text-blue-100 mt-4">
              Schedule appointments with top specialists in just a few clicks
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              {role === "admin"
                ? "Admin Login"
                : role === "doctor"
                ? "Doctor Login"
                : "Welcome Back"}
            </h2>
            <p className="text-gray-600 text-lg">
              {role === "admin"
                ? "Admin access only"
                : "Sign in to access your medical appointments"}
            </p>
          </div>

          {/* Error Message Display */}
          {(errors.email || errors.password || backendError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-lg">
                {backendError || errors.email || errors.password}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="block text-gray-700 text-xl font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-xl font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-5 w-5 text-blue-600"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="ml-2 text-gray-700">Remember me</label>
              </div>
              {showForgotPassword && (
                <a href={forgotPasswordLink} className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
            >
              Sign In
            </button>
          </form>

          {showSignup && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-lg">
                New patient?{" "}
                <a href={signupLink} className="text-blue-600 font-medium hover:underline">
                  Create an account
                </a>
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-center">For medical emergencies, please call 911</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonLogin;