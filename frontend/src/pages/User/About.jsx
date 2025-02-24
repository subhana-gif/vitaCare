import React from "react";

const About = () => {
  return (
    <section className="max-w-6xl mx-auto my-10 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        ABOUT <span className="text-blue-600">US</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <img
          src="https://via.placeholder.com/400x300"
          alt="Doctors"
          className="rounded-lg shadow-md"
        />
        <div>
          <p className="text-gray-700 leading-relaxed">
            Welcome to VitaCare, your trusted partner in managing your healthcare needs conveniently and efficiently. At VitaCare, we understand the challenges individuals face when scheduling doctor appointments and managing health records.
          </p>
          <h3 className="font-bold mt-4 text-lg text-gray-900">Our Vision</h3>
          <p className="text-gray-700 leading-relaxed">
            Our vision at VitaCare is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          WHY CHOOSE US
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="font-bold text-gray-900">EFFICIENCY:</h3>
            <p className="text-gray-600">
              Streamlined appointment scheduling that fits into your busy lifestyle.
            </p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="font-bold text-gray-900">CONVENIENCE:</h3>
            <p className="text-gray-600">
              Access to a network of trusted healthcare professionals in your area.
            </p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="font-bold text-gray-900">PERSONALIZATION:</h3>
            <p className="text-gray-600">
              Tailored recommendations and reminders to help you stay on top of your health.
            </p>
          </div>
        </div>
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
    </section>
  );
};

export default About;
