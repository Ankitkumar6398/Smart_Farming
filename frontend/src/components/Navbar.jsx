import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

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
      <Link to="/" className="logo" onClick={closeMenu}>🌱 Kishan Mitra</Link>
      <button
        type="button"
        className="nav-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>
      <ul className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/crop-health" onClick={closeMenu}>Crop Health</Link></li>
        <li><Link to="/crop-recommendation" onClick={closeMenu}>Crop Recommendation</Link></li>
        <li><Link to="/irrigation" onClick={closeMenu}>Smart Irrigation</Link></li>
        <li><Link to="/market" onClick={closeMenu}>Market</Link></li>
        <li><Link to="/weather" onClick={closeMenu}>Weather</Link></li>
        <li><Link to="/community" onClick={closeMenu}>Community</Link></li>
        <li><Link to="/schemes" onClick={closeMenu}>Government Schemes</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
            <li><button type="button" onClick={() => { closeMenu(); handleLogout(); }} className="nav-logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
            <li><Link to="/register" className="nav-register-btn" onClick={closeMenu}>Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
