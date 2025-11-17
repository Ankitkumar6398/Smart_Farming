import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";



const Navbar = () => {

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🌱 Smart Farming</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/crop-health">Crop Health</Link></li>
        <li><Link to="/irrigation">Irrigation</Link></li>
        <li><Link to="/market">Market</Link></li>
        <li><Link to="/community">Community</Link></li>
        <li><Link to="/schemes">Schemes</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
