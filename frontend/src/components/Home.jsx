import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Fetch user data if authenticated
    if (token) {
      fetchUserData(token);
    }

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      const newToken = localStorage.getItem("token");
      setIsAuthenticated(!!newToken);
      if (newToken) {
        fetchUserData(newToken);
      } else {
        setUser(null);
      }
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

  const fetchUserData = async (token) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // fix crop.png image: ensure correct path and fallback
  // Set correct public path for crop image (public/images/crop.png)
  const cropImg = "/images/crop.png";
  const irrigationImg = "/images/irrigation.jpeg";
  const marketImg = "/images/market.webp"
  const fertilizerImg = "/images/fertilizer.webp"
  const communityImg = "/images/community.webp"
  const schemesImg = "/images/schemes.webp"
  const AI = "/images/AI.webp"
  const backgroundImg = "/images/farmer.jpg"

  
  const modules = [
    { 
      img: cropImg,
      title: "AI Crop Health Detection",
      desc: "Upload crop images to detect diseases instantly using advanced AI models.",
      gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
      path: "/crop-health"
    },
    { 
      img: irrigationImg,
      title: "Smart Irrigation System",
      desc: "Intelligent irrigation scheduling using weather and soil moisture data.",
      gradient: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
      path: "/irrigation"
    },
    { 
      img: marketImg,
      title: "Market Insights & Analytics",
      desc: "Get real-time mandi prices, predictions, and selling insights.",
      gradient: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
      path: "/market"
    },
    { 
      img: fertilizerImg,
      title: "Fertilizer Optimization",
      desc: "Personalized fertilizer and pesticide recommendations.",
      gradient: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
      path: "/fertilizer"
    },
    { 
      img: communityImg,
      title: "Community & Support",
      desc: "Talk to farmers, get support & share experiences.",
      gradient: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)",
      path: "/community"
    },
    { 
      img: schemesImg,
      title: "Government Schemes",
      desc: "Explore agriculture schemes, subsidies and benefits.",
      gradient: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
      path: "/schemes"
    }
  ];

  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="ai-badge">
            <span className="ai-icon-img">
              <img src={AI} alt="AI" />
            </span>
            <span>AI Powered</span>
          </div>

          <h1 className="hero-title">
            {isAuthenticated && user ? (
              <>
                Welcome back, <span className="gradient-text">{user.name}</span>! 👋
              </>
            ) : (
              <>
                Kishan Mitra
                <span className="gradient-text"> Revolution</span>
              </>
            )}
          </h1>

          <p className="hero-subtitle">
            {isAuthenticated && user
              ? "Continue managing your farm with AI-powered tools and insights."
              : "Real-time insights, disease detection, and data-driven recommendations for farmers."}
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered</div>
            </div>
          </div>

          <div className="hero-buttons">
            <button className="btn-primary-hero" onClick={() => navigate("/crop-health")}>
              {isAuthenticated ? "Explore Features" : "Get Started"}
            </button>
            {!isAuthenticated && (
              <button className="btn-secondary-hero" onClick={() => navigate("/register")}>
                Sign Up Free
              </button>
            )}
            {isAuthenticated && (
              <button className="btn-secondary-hero" onClick={() => navigate("/profile")}>
                View Profile
              </button>
            )}
          </div>
        </div>

        {/* Replace floating emoji cards with realistic images */}
        <div className="hero-visual">
          <div className="floating-card">
            <img src={cropImg} alt="Crop" className="floating-img" />
            <span className="card-text">Crop Analysis</span>
          </div>

          <div className="floating-card">
            <img src={irrigationImg} alt="Irrigation" className="floating-img" />
            <span className="card-text">Smart Irrigation</span>
          </div>

          <div className="floating-card">
            <img src={marketImg} alt="Market" className="floating-img" />
            <span className="card-text">Market Insights</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Platform Features</h2>
          <p className="section-subtitle">Smart tools designed for every farmer</p>
        </div>

        <div className="modules-grid">
          {modules.map((item, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ "--card-gradient": item.gradient }}
              onClick={() => navigate(item.path)}
            >
              <div className="feature-img-box">
                <img src={item.img} alt={item.title} className="feature-img" />
              </div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.desc}</p>
              <div className="feature-arrow">→</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
