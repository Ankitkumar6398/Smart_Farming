import React, { useState } from "react";
import "../styles/CropHealth.css";

const CropHealth = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); // Clear previous result
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return alert("Please upload an image first.");

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch(`${API_URL}/api/crop-health/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to analyze image");
      }

      const analysis = data.data || {};

      setResult({
        cropType: analysis.crop_type || "Unknown",
        disease: analysis.disease || "Unknown",
        accuracy: analysis.confidence != null ? `${Math.round(analysis.confidence * 100)}%` : "N/A",
        description: analysis.description || "",
        treatment: analysis.treatment || "",
        prevention: analysis.prevention || "",
        recommendations: analysis.recommendations || null,
      });
    } catch (err) {
      setError(err.message || "Failed to analyze image");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-container">
      <h1>Crop Health Detection</h1>
      <p>
        Upload a leaf image to receive instant AI-assisted disease identification,
        treatment suggestions, and prevention guidance.
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
          capture="environment"
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
      <button onClick={handleAnalyze} disabled={!selectedImage || loading}>
        {loading ? "Analyzing..." : selectedImage ? "Analyze Crop Health" : "Upload an Image to Continue"}
      </button>

      {error && (
        <div className="result-card" style={{ marginTop: "20px", borderColor: "#f5c2c7" }}>
          <h2 style={{ color: "#b42318" }}>Analysis Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="result-card">
          <h2>Analysis Result</h2>

          <div className="result-info">
            <div className="info-block">
              <strong>Crop Type:</strong>
              <p className="disease-badge" style={{ background: "#e3f2fd", color: "#1565c0" }}>{result.cropType}</p>
            </div>

            <div className="info-block">
              <strong>Disease Detected:</strong>
              <p className="disease-badge">{result.disease}</p>
            </div>

            <div className="info-block">
              <strong>Confidence:</strong>
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

          {result.recommendations && (
            <div className="treatment-section">
              <strong>Additional Recommendations</strong>
              <p>{result.recommendations}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="footer-note">
        <h3>Why Use AI for Crop Health?</h3>
        <p>
          AI-powered crop protection helps farmers detect diseases early,
          reduce pesticide usage, protect yield, and avoid major crop losses.
        </p>
      </div>
    </div>
  );
};

export default CropHealth;
