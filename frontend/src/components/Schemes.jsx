import React from "react";
import "../styles/Schemes.css";

const Schemes = () => {
  const schemes = [
    {
      title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      desc: "Crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities.",
      link: "https://pmfby.gov.in/"
    },
    {
      title: "Kisan Credit Card (KCC)",
      desc: "Provides short-term credit support to farmers for purchasing seeds, fertilizers, and agricultural expenses.",
      link: "https://www.india.gov.in/kisan-credit-card"
    },
    {
      title: "Soil Health Card Scheme",
      desc: "Helps farmers understand their soil nutrients and apply fertilizers accordingly to improve productivity.",
      link: "https://soilhealth.dac.gov.in/"
    },
    {
      title: "PM Krishi Sinchayee Yojana (PMKSY)",
      desc: "Ensures efficient water usage and improved irrigation systems across rural areas.",
      link: "https://pmksy.gov.in/"
    }
  ];

  return (
    <div className="schemes-container">
      <h1>📜 Government Schemes for Farmers</h1>
      <p>Explore the latest agricultural programs and benefits you can apply for.</p>

      <div className="schemes-grid">
        {schemes.map((item, index) => (
          <div key={index} className="scheme-card">
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <a href={item.link} target="_blank" rel="noreferrer">
              <button className="apply-btn">Apply Now</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;
