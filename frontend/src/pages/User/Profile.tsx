import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userService } from "../../services/userService";

interface User {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  dob?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
  });

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await userService.getProfile(accessToken as string);

        console.log("Profile Data:", profileData);

        // Set only the required fields in the state
        setUser({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          gender: profileData.gender,
          dob: profileData.dob,
        });

        setFormData({
          name: profileData.name || "",
          email: profileData.email || "", // Ensure email is set from profile data
          phone: profileData.phone || "",
          address: profileData.address || "",
          gender: profileData.gender || "",
          dob: profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please log in again.");
        setLoading(false);
      }
    };

    if (authUser && accessToken) {
      fetchUserProfile();
    }
  }, [authUser, accessToken]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Prevent changes to email field
    if (name === "email") return;
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    const { name, phone, address, gender, dob } = formData;
  
    try {
      const response = await userService.updateProfile(accessToken as string, {
        name: String(name),
        phone: String(phone || ""),
        address: String(address),
        gender: String(gender),
        dob: String(dob),
      });
  
      // Update user state with the response, but keep the original email
      setUser({
        ...response,
        email: user?.email || "" // Preserve the original email
      });
  
      // Update formData but keep the original email
      setFormData(prev => ({
        ...prev,
        name: response.name || "",
        phone: response.phone || "",
        address: response.address || "",
        gender: response.gender || "",
        dob: response.dob || "",
        // email is not changed
      }));
  
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
      console.error("Error updating profile:", err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
        <div className="flex items-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Define the fields to display with icons and labels
  const fieldsConfig = [
    { key: "name", label: "Full Name", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { key: "email", label: "Email Address", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { key: "phone", label: "Phone Number", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { key: "address", label: "Address", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    { key: "dob", label: "Date of Birth", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "gender", label: "Gender", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getGenderDisplayText = (gender: string) => {
    if (!gender) return "Not provided";
    const formattedGender = gender.toLowerCase();
    if (formattedGender === "prefer-not-to-say") return "Prefer not to say";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold mb-4 md:mb-0 md:mr-6">
          {user?.name ? getInitials(user.name) : "?"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{user?.name || "User"}</h1>
          <p className="text-gray-500">{user?.email}</p>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldsConfig.map((field) => (
            <div key={field.key} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                </svg>
                <h3 className="text-gray-600 font-medium">{field.label}</h3>
              </div>
              <p className="text-lg pl-7">
                {field.key === "dob" && user?.[field.key]
                  ? `${calculateAge(user[field.key] as string)} years old (${new Date(
                      user[field.key] as string
                    ).toLocaleDateString()})`
                  : field.key === "gender" && user?.[field.key]
                  ? getGenderDisplayText(user[field.key] as string)
                  : user?.[field.key as keyof User] || "Not provided"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldsConfig.map((field) => (
              <div key={field.key} className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium  items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                  </svg>
                  {field.label}
                </label>
                {field.key === "gender" ? (
                  <select
                    name={field.key}
                    value={formData[field.key as keyof User] || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : field.key === "email" ? (
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1 italic">Email cannot be changed</p>
                  </div>
                ) : (
                  <input
                    type={field.key === "dob" ? "date" : "text"}
                    name={field.key}
                    value={formData[field.key as keyof User] || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex space-x-4 mt-6">
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;