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

      <div className="upload-area-wrapper">
        <input 
          type="file" 
          id="image-upload"
          accept="image/*" 
          onChange={handleImageChange}
        />
        <label htmlFor="image-upload" className="file-upload-label">
          <span className="upload-icon">📸</span>
          <span className="upload-text">
            {selectedImage ? "Change Image" : "Click to Upload Image"}
          </span>
          <span className="upload-subtext">
            {selectedImage ? selectedImage.name : "PNG, JPG, JPEG up to 10MB"}
          </span>
        </label>
        {selectedImage && (
          <div className="file-name">✓ {selectedImage.name}</div>
        )}
      </div>

      {preview && (
        <div className="preview-wrapper">
          <img src={preview} alt="Preview" className="preview" />
        </div>
      )}

      <button onClick={handleAnalyze} disabled={!selectedImage}>
        {selectedImage ? "🔍 Analyze Crop Health" : "Please Upload an Image First"}
      </button>

      {result && (
        <div className="result-card">
          <h2>
            Analysis Result
            <span className="disease-badge">{result.disease}</span>
          </h2>
          <div className="treatment-section">
            <strong>💊 Treatment Recommendation</strong>
            <p>{result.treatment}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHealth;
