import React from "react";
import { Button } from "@/components/ui/button";

const specialties = [
  { name: "General Physician", icon: "👨‍⚕️" },
  { name: "Gynecologist", icon: "👩‍⚕️" },
  { name: "Dermatologist", icon: "🧑‍⚕️" },
  { name: "Pediatrician", icon: "👶" },
  { name: "Neurologist", icon: "🧠" },
  { name: "Gastroenterologist", icon: "👨‍⚕️" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center shadow-md bg-blue-600">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 bg-white rounded-lg"></div>
          <span className="text-xl font-semibold">Prescripto</span>
        </div>
        <div className="flex space-x-6">
          <a href="/" className="text-white hover:text-gray-300">HOME</a>
          <a href="/doctors" className="text-white hover:text-gray-300">ALL DOCTORS</a>
          <a href="/about" className="text-white hover:text-gray-300">ABOUT</a>
          <a href="/contact" className="text-white hover:text-gray-300">CONTACT</a>
          <a href="/admin" className="text-white hover:text-gray-300">Admin Panel</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-blue-500 px-6 py-16">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="w-1/2">
            <h1 className="text-5xl font-bold text-white mb-4">
              Book Appointment<br />
              With Trusted Doctors
            </h1>
            <p className="text-white mb-8">
              Browse through our extensive list of trusted doctors and schedule your appointment hassle-free.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Book Appointment →
            </Button>
          </div>
          <div className="w-1/2">
            <img
              src="/images/doctor-hero.png"
              alt="Doctors Team"
              className="w-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Find by Speciality
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Browse through different medical specialties and find the right doctor for your needs.
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {specialties.map((specialty, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">{specialty.icon}</span>
                </div>
                <span className="text-sm text-center">{specialty.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        © 2025 Prescripto | All Rights Reserved.
      </footer>
    </div>
  );
};

export default Home;
