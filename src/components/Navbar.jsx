import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      {/* Logo on the Left */}
      <Link to="/" className="text-3xl font-bold text-red-600">
        LuxeStream
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-6">
        <Link to="/aboutus" className="hover:underline">About Us</Link>
        <Link to="/careers" className="hover:underline">Careers</Link>
        <Link to="/helpcenter" className="hover:underline">Help Center</Link>
        <Link to="/contactus" className="hover:underline">Contact Us</Link>
      </div>
    </nav>
  );
};

export default Navbar; 