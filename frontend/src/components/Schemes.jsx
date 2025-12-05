import React from "react";
import "../styles/Schemes.css";
import { FiExternalLink } from "react-icons/fi";

const Schemes = () => {
  const schemes = [
    {
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      desc: "Financial protection to farmers against crop loss due to natural calamities, pests, and diseases with affordable premium rates.",
      link: "https://pmfby.gov.in/",
    },
    {
      title: "Kisan Credit Card (KCC)",
      desc: "A simple and flexible credit system enabling farmers to access short-term loans for seeds, fertilizers, and other agricultural needs.",
      link: "https://www.india.gov.in/kisan-credit-card",
    },
    {
      title: "Soil Health Card Scheme",
      desc: "A government initiative helping farmers assess soil quality and nutrient levels to improve crop yield through scientific fertilizer suggestions.",
      link: "https://soilhealth.dac.gov.in/",
    },
    {
      title: "PM Krishi Sinchayee Yojana (PMKSY)",
      desc: "Focused on improved irrigation efficiency, water conservation, and enabling farmers to achieve 'More Crop Per Drop'.",
      link: "https://pmksy.gov.in/",
    }
  ];

  return (
    <div className="schemes-container">
      <h1>📜 Government Schemes for Farmers</h1>
      <p>
        Discover official agricultural schemes designed to support farmers in improving yield, 
        reducing risks, and accessing financial and technological benefits.
      </p>

      <div className="schemes-grid">
        {schemes.map((scheme, index) => (
          <div key={index} className="scheme-card">
            <h2>{scheme.title}</h2>

            <p>{scheme.desc}</p>

            <a 
              href={scheme.link} 
              target="_blank" 
              rel="noreferrer"
              className="apply-btn"
            >
              Apply Now <FiExternalLink size={18} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;
