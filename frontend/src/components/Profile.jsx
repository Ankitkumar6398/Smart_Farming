import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch profile");
      }

      setUser(data.user);
      setEditData({ name: data.user?.name, email: data.user?.email });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/user/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser({ ...user, name: data.user.name, email: data.user.email });
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  if (loading)
    return (
      <div className="profile-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (error && !user)
    return (
      <div className="profile-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="avatar-circle">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1>Farmer Profile 👨‍🌾</h1>
          <p className="member-since">Member since {formatDate(user?.createdAt)}</p>
        </div>

        {/* Info Section */}
        <div className="profile-info">
          {isEditing ? (
            <>
              <div className="info-row">
                <label>Name:</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="info-row">
                <label>Email:</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="info-row">
                <label>👤 Full Name:</label>
                <span>{user?.name || "N/A"}</span>
              </div>
              <div className="info-row">
                <label>📧 Email:</label>
                <span>{user?.email || "N/A"}</span>
              </div>
              <div className="info-row">
                <label>🆔 User ID:</label>
                <span>{user?.id || "N/A"}</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="profile-buttons">
          {isEditing ? (
            <>
              <button className="btn-primary" onClick={handleSave}>
                💾 Save Changes
              </button>
              <button className="btn-secondary" onClick={handleEditToggle}>
                ❌ Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={handleEditToggle}>
                ✏️ Edit Profile
              </button>
              <button className="btn-secondary" onClick={() => navigate("/")}>
                🏠 Home
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
