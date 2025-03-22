import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { doctorService } from "../../services/doctorService";
import { toast } from "react-toastify";
import * as yup from "yup";

interface DoctorSignupData {
  name: string;
  email: string;
  password: string;
}

// Yup validation schema
const doctorSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
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
      navigate("/doctors/login");  // 🚨 Redirect to login after success
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-blue-600">Doctor Signup</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={doctor.name}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={doctor.email}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={doctor.password}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded w-full"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSignup;
