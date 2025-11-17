import React, { useState } from "react";
import "../styles/CropHealth.css";

const CropHealth = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = () => {
    if (!selectedImage) return alert("Please upload an image first!");
    // Dummy AI result (frontend only)
    setResult({
      disease: "Leaf Spot Detected",
      treatment: "Spray neem oil twice a week and ensure proper drainage."
    });
  };

  return (
    <div className="crop-container">
      <h1>🌾 Crop Health Detection</h1>
      <p>Upload a photo of your crop leaf and get AI-based diagnosis (demo).</p>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && <img src={preview} alt="Preview" className="preview" />}

      <button onClick={handleAnalyze}>Analyze</button>

      {result && (
        <div className="result-card">
          <h2>Disease Detected: {result.disease}</h2>
          <p><strong>Treatment:</strong> {result.treatment}</p>
        </div>
      )}
    </div>
  );
};

export default CropHealth;
