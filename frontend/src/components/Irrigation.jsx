import React, { useState } from "react";
import "../styles/Irrigation.css";

const Irrigation = () => {
  const [crop, setCrop] = useState("");
  const [moisture, setMoisture] = useState("");
  const [schedule, setSchedule] = useState(null);

  const handleSubmit = () => {
    if (!crop || !moisture) return alert("Please fill all fields!");
    // Dummy recommendation
    setSchedule({
      message: `For ${crop}, irrigation is needed soon.`,
      duration: "Water for 2 hours every alternate day."
    });
  };

  return (
    <div className="irrigation-container">
      <h1>💧 Smart Irrigation</h1>
      <p>Get personalized irrigation timing based on soil and crop data.</p>

      <div className="form">
        <input
          type="text"
          placeholder="Enter Crop Type"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
        <input
          type="number"
          placeholder="Soil Moisture (%)"
          value={moisture}
          onChange={(e) => setMoisture(e.target.value)}
        />
        <button onClick={handleSubmit}>Get Schedule</button>
      </div>

      {schedule && (
        <div className="schedule-card">
          <h3>Recommended Irrigation</h3>
          <p>{schedule.message}</p>
          <strong>Duration: {schedule.duration}</strong>
        </div>
      )}
    </div>
  );
};

export default Irrigation;
