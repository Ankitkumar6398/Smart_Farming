import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', handleAuthChange);
    
    // Listen for custom auth-change event (login/logout in same tab)
    window.addEventListener('auth-change', handleAuthChange);
    
    // Also check on focus (in case login happened in another tab)
    window.addEventListener('focus', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🌱 Kishan Mitra</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/crop-health">Crop Health</Link></li>
        <li><Link to="/irrigation">Irrigation</Link></li>
        <li><Link to="/market">Market</Link></li>
        <li><Link to="/weather">Weather</Link></li>
        <li><Link to="/community">Community</Link></li>
        <li><Link to="/schemes">Schemes</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={handleLogout} className="nav-logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="nav-register-btn">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
