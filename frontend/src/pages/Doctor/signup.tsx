import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doctorService } from "../../services/doctorService";
import { toast } from "react-toastify";
import * as yup from "yup";
import axios from "axios";

interface DoctorSignupData {
  name: string;
  email: string;
  password: string;
}

const doctorSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const DoctorSignup: React.FC = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorSignupData>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await doctorSchema.validate(doctor, { abortEarly: false });

      const data = await doctorService.signupDoctor(doctor);
      toast.success("Registration successful! Please log in.");
      navigate("/doctors/login");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="flex w-full max-w-5xl bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Left Side - Branding */}
        <div className=" md:block w-1/2 bg-blue-600 p-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">VitaCare</h1>
            <div className="text-9xl py-24">🩺</div>
            <p className="text-white text-xl">Join our network of healthcare professionals</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Doctor Registration</h2>
            <p className="text-gray-600 text-lg">Create your professional account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-lg font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={doctor.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={doctor.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="doctor@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-lg font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={doctor.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="At least 6 characters"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 text-xl font-medium rounded-lg hover:bg-blue-700 transition duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/doctors/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignup;