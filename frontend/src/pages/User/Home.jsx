import React, { useState,useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Import a user circle icon

const HomePage = () => {
  const specialties = [
    { name: "General physician", icon: "👨‍⚕️" },
    { name: "Gynecologist", icon: "👩‍⚕️" },
    { name: "Dermatologist", icon: "🧑‍⚕️" },
    { name: "Pediatrician", icon: "👶" },
    { name: "Neurologist", icon: "🧠" },
    { name: "Gastroenterologist", icon: "👨‍⚕️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">Book Appointment With Trusted Doctors</h1>
            <p className="text-2xl mb-8 opacity-90">Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-3xl font-medium hover:bg-gray-100 transition-colors">
              Book appointment →
            </button>
          </div>
          <div className="hidden lg:block">
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="max-w-8xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-3">Find by Speciality</h2>
        <p className="text-gray-600 text-2xl mb-10">Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map((specialty, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-sm text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-blue-50"
            >
              <div className="text-6xl mb-4">{specialty.icon}</div>
              <p className="text-gray-800 text-2xl font-medium break-words whitespace-normal">
                {specialty.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-9xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="text-red-500 text-3xl">💙</div>
                <span className="text-2xl font-bold">VitaCare</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">COMPANY</h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">Home</p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">About us</p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">Delivery</p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">Privacy policy</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">GET IN TOUCH</h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-lg">+0-000-000-000</p>
                <p className="text-gray-600 text-lg">vitaCare@email.com</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-gray-600">
            <p className="text-lg">Copyright 2024 @ vitaCare - All Right Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;