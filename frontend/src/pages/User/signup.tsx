import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/userService";
import CommonOtpInput from "../../components/common/otpInput"; // ✅ Import CommonOtpInput
import * as yup from "yup";
import axios from "axios";

// Define the Yup validation schema
const signupSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Signup: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [otpRequestCount, setOtpRequestCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(60);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the form data
      await signupSchema.validate({ name, email, password }, { abortEarly: false });

      // Clear any existing errors
      setErrors({});

      setIsSubmitting(true);
      const res = await userService.sendOTP(email);

      setMessage(res.data.message);
      setMessageType("success");
      setStep(2); // Move to OTP verification step
      setOtpRequestCount((prev) => prev + 1);
      setTimer(60);
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
      }  else if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Error sending OTP");
        setMessageType("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    if (otpRequestCount >= 3) {
      setMessage("Maximum OTP requests reached. Please try again later.");
      setMessageType("error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await userService.resendOTP(email);

      setMessage(res.data.message);
      setMessageType("success");
      setOtpRequestCount((prev) => prev + 1);
      setTimer(60);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error resending OTP");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const res = await userService.verifyOTP(email, otp);
      console.log("res.data.success:",res.data.success)
      if (res.data.success) {
        const signupRes = await userService.signup(name, email, password);
        console.log("sign up details:",signupRes)
        console.log("signres.data.success",signupRes.data.success)
        if (signupRes.data.success) {
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error verifying OTP");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="flex w-full max-w-5xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className=" md:block w-1/2 bg-blue-600 p-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">VitaCare</h1>
            <div className="text-9xl py-24">🤍</div>
            <p className="text-white text-xl">Join our healthcare network</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600 text-lg">
              {step === 1 ? "Enter your details to get started" : "Verify your email with OTP"}
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={sendOTP} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Sending..." : "Continue"}
              </button>
            </form>
          ) : (
            <CommonOtpInput
              otp={otp}
              setOtp={setOtp}
              handleVerifyOtp={verifyOTP}
              isSubmitting={isSubmitting}
              resendOTP={resendOTP}
              timer={timer}
              otpRequestCount={otpRequestCount}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;