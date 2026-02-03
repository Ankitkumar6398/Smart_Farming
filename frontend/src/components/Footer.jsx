import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* About Section */}
        <div className="footer-section about">
          <div className="footer-logo">
            <h2>Kishan Mitra</h2>
          </div>

          <p className="footer-description">
            Empowering farmers with smart tools for crop health detection, 
            irrigation management, market insights, and data-based recommendations. 
            Making agriculture smarter and more sustainable.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/crop-health">Crop Health</Link></li>
            <li><Link to="/crop-recommendation">Crop Recommendation</Link></li>
            <li><Link to="/irrigation">Irrigation</Link></li>
            <li><Link to="/market">Market</Link></li>
            <li><Link to="/community">Community</Link></li>
            <li><Link to="/schemes">Schemes</Link></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-section features">
          <h3 className="footer-heading">Features</h3>
          <ul className="footer-links-list">
            <li>Disease Detection</li>
            <li>Smart Irrigation</li>
            <li>Market Analytics</li>
            <li>Fertilizer Optimization</li>
            <li>Recommendations</li>
            <li>Mobile Support</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h3 className="footer-heading">Contact Us</h3>
          <div className="contact-info">

            <div className="contact-item">
              <span>GLA University, Mathura, India</span>
            </div>

            <div className="contact-item">
              <a href="mailto:smartfarming@gmail.com">smartfarming@gmail.com</a>
            </div>

            <div className="contact-item">
              <a href="tel:+919876543210">+91 9876543210</a>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© 2025 Kishan Mitra | All Rights Reserved</p>

          <div className="footer-bottom-links">
            <Link to="/">Privacy Policy</Link>
            <span>|</span>
            <Link to="/">Terms of Service</Link>
            <span>|</span>
            <Link to="/">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
