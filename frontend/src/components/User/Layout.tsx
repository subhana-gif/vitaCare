import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
