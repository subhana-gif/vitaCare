import React from "react";

const Contact = () => {
  return (
    <div className="max-w-6xl mx-auto my-10 px-4">
      {/* Contact Title */}
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        CONTACT <span className="text-blue-600">US</span>
      </h2>

      {/* Contact Details Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <img
          src="https://via.placeholder.com/400x300"
          alt="Doctor Consultation"
          className="rounded-lg shadow-md"
        />

        {/* Contact Info */}
        <div>
          <h3 className="font-bold text-lg text-gray-900">OUR OFFICE</h3>
          <p className="text-gray-700 mt-2">
            00000 Willms Station <br />
            Suite 000, Washington, USA
          </p>
          <p className="text-gray-700 mt-2">
            <strong>Tel:</strong> (000) 000-0000 <br />
            <strong>Email:</strong>{" "}
            <a href="mailto:greatstackdev@gmail.com" className="text-blue-600">
              greatstackdev@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-50 mt-10 py-6 px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Logo and Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-blue-600 mr-2">❤️</span> VitaCare
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard since the
              1500s.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-gray-900">COMPANY</h3>
            <ul className="text-gray-600 mt-2 text-sm">
              <li>Home</li>
              <li>About Us</li>
              <li>Delivery</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="font-bold text-gray-900">GET IN TOUCH</h3>
            <p className="text-gray-600 mt-2 text-sm">+0-000-000-000</p>
            <a
              href="mailto:greatstackdev@gmail.com"
              className="text-blue-600 text-sm"
            >
              greatstackdev@gmail.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm mt-4">
          Copyright 2025@ VitaCare.com - All Rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default Contact;
