import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AdminRoutes from "../src/routes/adminRoutes";
import DoctorRoutes from "../src/routes/doctorRoutes";
import UserRoutes from "../src/routes/userRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTolgee } from "@tolgee/react";

const LanguageSelector = () => {
  const { changeLanguage, getLanguage } = useTolgee();
  const currentLanguage = getLanguage() || localStorage.getItem("lang") || "en";
  const [lang, setLang] = useState(currentLanguage);

  return (
    <select
      value={lang}
      onChange={(e) => {
        const newLang = e.target.value;
        changeLanguage(newLang); // ✅ Call directly
        localStorage.setItem("lang", newLang);
        setLang(newLang);
      }}
    >
      <option value="en">English</option>
      <option value="fr">French</option>
    </select>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <LanguageSelector />
        <UserRoutes />
        <DoctorRoutes />
        <AdminRoutes />
      </>
    </Router>
  );
};

export default App;
