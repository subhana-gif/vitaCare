import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6">
        <Outlet /> {/* This will render the child components based on the route */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
