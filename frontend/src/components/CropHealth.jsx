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
    setResult(null); // Clear previous result
  };

  const handleAnalyze = () => {
    if (!selectedImage) return alert("Please upload an image first.");

    // Temporary demo output (AI connection will be added later)
    setTimeout(() => {
      setResult({
        disease: "Leaf Spot Detected",
        accuracy: "92% (demo estimation)",
        description:
          "Leaf spot is a common fungal issue that creates small brown or black circular marks on leaves.",
        treatment:
          "Use an organic neem oil spray twice a week. Remove affected leaves and improve air circulation. Avoid overhead watering.",
        prevention:
          "Ensure proper spacing between plants, avoid waterlogging, and monitor leaves weekly to catch early symptoms."
      });
    }, 1000);
  };

  return (
    <div className="crop-container">
      <h1>Crop Health Detection</h1>
      <p>
        Upload a leaf image to receive instant AI-assisted disease identification,
        treatment suggestions, and prevention guidance.  
        This version is a demo — full AI integration will be added soon.
      </p>

      {/* --- Steps Section --- */}
      <div className="steps-section">
        <h2>How This Tool Works</h2>
        <ul>
          <li>
            <strong>Step 1:</strong> Capture a clear photo of the affected crop leaf.
          </li>
          <li>
            <strong>Step 2:</strong> Upload the leaf image using the upload box below.
          </li>
          <li>
            <strong>Step 3:</strong> Click the “Analyze Crop Health” button.
          </li>
          <li>
            <strong>Step 4:</strong> AI checks the leaf pattern, color, and texture.
          </li>
          <li>
            <strong>Step 5:</strong> You receive disease detection, treatment, and prevention tips.
          </li>
        </ul>
      </div>

      {/* Image Upload */}
      <div className="upload-area-wrapper">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
        />

        <label htmlFor="image-upload" className="file-upload-label">
          <span className="upload-text">
            {selectedImage ? "Change Image" : "Upload Image"}
          </span>
          <span className="upload-subtext">
            {selectedImage
              ? selectedImage.name
              : "Supported formats: PNG, JPG, JPEG (Max: 10MB)"}
          </span>
        </label>

        {selectedImage && (
          <div className="file-name">{selectedImage.name}</div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="preview-wrapper">
          <img src={preview} alt="Preview" className="preview" />
        </div>
      )}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={!selectedImage}>
        {selectedImage ? "Analyze Crop Health" : "Upload an Image to Continue"}
      </button>

      {/* Result Section */}
      {result && (
        <div className="result-card">
          <h2>Analysis Result</h2>

          <div className="result-info">
            <div className="info-block">
              <strong>Disease Detected:</strong>
              <p className="disease-badge">{result.disease}</p>
            </div>

            <div className="info-block">
              <strong>Accuracy (Demo):</strong>
              <p>{result.accuracy}</p>
            </div>

            <div className="info-block">
              <strong>Description:</strong>
              <p>{result.description}</p>
            </div>
          </div>

          <div className="treatment-section">
            <strong>Treatment Recommendation</strong>
            <p>{result.treatment}</p>
          </div>

          <div className="treatment-section">
            <strong>Prevention Tips</strong>
            <p>{result.prevention}</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="footer-note">
        <h3>Why Use AI for Crop Health?</h3>
        <p>
          AI-powered crop protection helps farmers detect diseases early,
          reduce pesticide usage, protect yield, and avoid major crop losses.
        </p>

        <p>
          Real-time crop disease identification will be enabled in the next
          update using machine learning and image classification models.
        </p>
      </div>
    </div>
  );
};

export default CropHealth;
