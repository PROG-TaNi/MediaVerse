import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Routes where we don't want to show the navbar
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !authRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {shouldShowNavbar && <Footer />}
    </div>
  );
};

export default Layout; 