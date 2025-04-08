import { FaUserMd, FaHeartbeat, FaCalendarCheck } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">About Our Platform</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connecting patients with trusted healthcare professionals for seamless medical consultations.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" 
                alt="Doctor consultation"
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold text-blue-700 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To revolutionize healthcare accessibility by bridging the gap between patients and doctors through 
                advanced technology and compassionate service.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaHeartbeat className="text-blue-500 mt-1 mr-3 text-xl" />
                  <span className="text-gray-700">Patient-centered care approach</span>
                </li>
                <li className="flex items-start">
                  <FaUserMd className="text-blue-500 mt-1 mr-3 text-xl" />
                  <span className="text-gray-700">Verified and experienced doctors</span>
                </li>
                <li className="flex items-start">
                  <FaCalendarCheck className="text-blue-500 mt-1 mr-3 text-xl" />
                  <span className="text-gray-700">Easy appointment scheduling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-500">Specialized Doctors</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-500">Patients Served</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-500">Availability</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-gray-500">Medical Specialties</div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-blue-700 mb-8">Meet Our Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Sarah Johnson", role: "Medical Director", img: "https://randomuser.me/api/portraits/women/44.jpg" },
              { name: "Michael Chen", role: "Tech Lead", img: "https://randomuser.me/api/portraits/men/32.jpg" },
              { name: "Priya Patel", role: "Patient Experience", img: "https://randomuser.me/api/portraits/women/68.jpg" }
            ].map((person, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={person.img} 
                  alt={person.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                />
                <h3 className="text-xl font-medium text-gray-800">{person.name}</h3>
                <p className="text-blue-600">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;