import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Calendar, Clock, Star, Shield, Users } from "lucide-react";
import { fetchHealthArticles } from "../../services/healthservice";
import { motion } from "framer-motion";
import { T } from "@tolgee/react";

interface Specialty {
  name: string;
  icon: string;
}

interface Testimonial {
  name: string;
  rating: number;
  text: string;
}

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
}
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);


  const specialties = [
    { name: "general physician", icon: "👨‍⚕️" },
    { name: "gynecologist", icon: "👩‍⚕️" },
    { name: "dermatologist", icon: "🧑‍⚕️" },
    { name: "pediatrician", icon: "👶" },
    { name: "neurologist", icon: "🧠" },
    { name: "gastroenterologist", icon: "👨‍⚕️" }
  ];
  
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "VitaCare made it so easy to find a specialist. The booking process was seamless and I got an appointment the same week!"
    },
    {
      name: "Michael Chen",
      rating: 5,
      text: "I've been using VitaCare for my family's medical needs for over a year. Their doctors are professional and the platform is user-friendly."
    },
    {
      name: "Elena Rodriguez",
      rating: 4,
      text: "The follow-up care and reminders are excellent. My doctor was able to address all my concerns during the video consultation."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const loadArticles = async () => {
      const data = await fetchHealthArticles();
      setArticles(data);
      setLoading(false);
    };

    loadArticles();
  }, []);


  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/doctors?specialty=${encodeURIComponent(specialty.name)}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              <T keyName="Book_Appointment_With_Trusted_Doctors">Book Appointment With Trusted Doctors</T>
            </h1>
            <p className="text-2xl mb-8 opacity-90">
              <T keyName="Simply_browse_through_our_extensive_list_of_trusted_doctors,">Simply browse through our extensive list of trusted doctors,</T>
              <T keyName="schedule_your_appointment_hassle_free.">schedule your appointment hassle-free.</T>
            </p>
            <button
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-3xl font-medium hover:bg-gray-100 transition-colors"
              onClick={() => navigate("/doctors")}
            >
              <T keyName="Book appointment →">Book appointment →</T>
            </button>
          </div>
          <div className="hidden lg:block"></div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="max-w-8xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-3">
          <T keyName="Find by Speciality">Find by Speciality</T>
        </h2>
        <p className="text-gray-600 text-2xl mb-10">
          <T keyName="Simply browse through our extensive list of trusted doctors, schedule
          your appointment hassle-free.">
          Simply browse through our extensive list of trusted doctors, schedule
          your appointment hassle-free.
          </T>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  {specialties.map((specialty, index) => (
    <div
      key={index}
      className="bg-white p-8 rounded-lg shadow-sm text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-blue-50"
      onClick={() => handleSpecialtyClick(specialty)}
    >
      <div className="text-6xl mb-4">{specialty.icon}</div>
      <p className="text-gray-800 text-2xl font-medium break-words whitespace-normal">
        <T keyName={`${specialty.name}`} />
      </p>
    </div>
  ))}
</div>;      </div>


      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-3">What Our Patients Say</h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Read testimonials from patients who have used our platform to connect with healthcare professionals.
          </p>
        </motion.div>
        
        <div className="relative overflow-hidden">
          <motion.div 
            className="flex"
            animate={{ x: `-${currentTestimonial * 100}%` }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="min-w-full px-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                  <div className="flex items-center mb-6">
                    <div>
                      <h4 className="font-bold text-xl">{testimonial.name}</h4>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < testimonial.rating ? "currentColor" : "none"} 
                            className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg italic">"{testimonial.text}"</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🩺 Latest Health Articles</h1>

      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4">
              <img
                src={article.urlToImage || "/placeholder.jpg"}
                alt={article.title}
                className="w-full h-auto object-cover rounded"
              />
              <h2 className="text-lg font-bold mt-4">{article.title}</h2>
              <p className="text-gray-600">{article.description}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 mt-2 block"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      )}
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
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">
                  Home
                </p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">
                  About us
                </p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">
                  Delivery
                </p>
                <p className="text-gray-600 text-lg hover:text-blue-600 cursor-pointer">
                  Privacy policy
                </p>
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
            <p className="text-lg">
              Copyright 2024 @ VitaCare - All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-6 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
        onClick={() => navigate("/chat")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle size={40} />
      </motion.button>    </div>
  );
};

export default HomePage;
