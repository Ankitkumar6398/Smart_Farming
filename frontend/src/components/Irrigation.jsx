import React, { useState } from "react";
import "../styles/Irrigation.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Smart irrigation using weather module
const Irrigation = () => {
  const [city, setCity] = useState("");
  const [crop, setCrop] = useState("");
  const [moisture, setMoisture] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseJSONResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error("Server returned non-JSON. Ensure backend is running.");
    }
    return await response.json();
  };

  const estimateSoilMoistureFromWeather = (weatherData) => {
    if (!weatherData) return { value: 50, label: "No data" };
    const temp = weatherData.temperature ?? 25;
    const humidity = weatherData.humidity ?? 50;
    const main = (weatherData.main || "").toLowerCase();
    const desc = (weatherData.description || "").toLowerCase();
    const wind = weatherData.windSpeed ?? 0;
    const cloudiness = weatherData.cloudiness ?? 50;
    const rain1h = weatherData.rain1h ?? 0;
    const isRain = main === "rain" || desc.includes("rain") || desc.includes("drizzle") || desc.includes("thunderstorm");

    let base = humidity * 0.5;
    if (isRain || rain1h > 0) base = Math.min(95, 70 + Math.min(rain1h * 8, 25) + (isRain ? 10 : 0));
    else {
      base += (100 - cloudiness) * 0.08;
      base -= Math.max(0, (temp - 25) * 0.8);
      base -= Math.min(15, wind * 2);
    }
    const value = Math.round(Math.max(5, Math.min(95, base)));
    return { value, label: "Estimated from weather" };
  };

  const getIrrigationRecommendation = (weatherData, moistureVal, cropName) => {
    const temp = weatherData?.temperature ?? 25;
    const humidity = weatherData?.humidity ?? 50;
    const main = (weatherData?.main || "").toLowerCase();
    const desc = (weatherData?.description || "").toLowerCase();
    const isRain = main === "rain" || desc.includes("rain") || desc.includes("drizzle") || desc.includes("thunderstorm");
    const moisture = Number(moistureVal) || 50;

    if (isRain) {
      return {
        message: `Rain expected in ${weatherData?.city || "your area"}. Postpone irrigation to save water and avoid overwatering.`,
        duration: "Skip irrigation today. Check again after rain stops.",
        tip: "Use rain water; avoid running pumps during rain.",
      };
    }

    if (moisture >= 70) {
      return {
        message: `Soil moisture (${moisture}%) is good for ${cropName || "your crop"}. No irrigation needed now.`,
        duration: "Monitor moisture; irrigate when it drops below 50–60%.",
        tip: "High humidity (" + humidity + "%) reduces evaporation. Save water.",
      };
    }

    if (moisture < 30) {
      const urgency = temp > 32 ? "Irrigate soon—high temperature increases water loss." : "Irrigate to avoid stress.";
      return {
        message: `Low soil moisture (${moisture}%) for ${cropName || "your crop"}. ${urgency}`,
        duration: temp > 35 ? "Water 1–1.5 hours in early morning or evening." : "Water 45–60 min in morning or evening.",
        tip: "Avoid midday; high temp causes evaporation loss.",
      };
    }

    const needMore = temp > 32 && humidity < 50;
    if (needMore) {
      return {
        message: `Hot (${temp}°C) and dry (${humidity}% humidity). ${cropName || "Crop"} may need irrigation soon.`,
        duration: "Water 45–60 min in early morning. Reduce if rain forecast.",
        tip: "Morning irrigation reduces evaporation.",
      };
    }

    return {
      message: `For ${cropName || "your crop"} in current weather (${temp}°C, ${humidity}% humidity), moderate irrigation is suitable.`,
      duration: "Water 30–45 min every 1–2 days. Adjust by soil moisture.",
      tip: "Check soil before each irrigation.",
    };
  };

  const handleSubmit = async () => {
    if (!crop?.trim()) return alert("Please enter crop type.");
    if (!city?.trim()) return alert("Please enter city/location.");

    setLoading(true);
    setError("");
    setSchedule(null);
    setWeather(null);

    try {
      const res = await fetch(
        `${API_URL}/api/weather?city=${encodeURIComponent(city.trim())}&country=in`
      );
      const result = await parseJSONResponse(res);

      if (!result.success || !result.data) {
        setError(result.message || "Could not fetch weather.");
        setLoading(false);
        return;
      }

      const weatherData = result.data;
      const moistureEst = estimateSoilMoistureFromWeather(weatherData);
      const moistureToUse = moisture.trim() !== "" ? Number(moisture.trim()) : moistureEst.value;

      setWeather({ ...weatherData, estimatedMoisture: moistureEst });
      const recommendation = getIrrigationRecommendation(
        weatherData,
        String(moistureToUse),
        crop.trim()
      );
      if (moisture.trim() === "") {
        recommendation.usedEstimate = true;
        recommendation.estimatedMoisture = moistureEst.value;
      }
      setSchedule(recommendation);
    } catch (err) {
      setError(err.message || "Failed to fetch weather. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="irrigation-container">
      <h1>💧 Smart Irrigation</h1>
      <p>Weather-based irrigation timing using live weather and soil moisture.</p>

      <div className="form">
        <input
          type="text"
          placeholder="City / Location (e.g. Delhi, Mumbai)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Crop Type (e.g. Wheat, Rice)"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Soil Moisture (%) — optional, estimate from weather"
          value={moisture}
          onChange={(e) => setMoisture(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Checking weather…" : "Get Schedule"}
        </button>
      </div>

      {error && (
        <div className="irrigation-error">
          ⚠️ {error}
        </div>
      )}

      {weather && (
        <div className="weather-summary">
          <h3>🌤️ Current Weather ({weather.city})</h3>
          <p>
            {weather.temperature}°C, {weather.humidity}% humidity · {weather.description}
          </p>
          {weather.estimatedMoisture != null && (
            <p className="moisture-estimate">
              🌱 Soil moisture estimate: <strong>{weather.estimatedMoisture.value}%</strong> ({weather.estimatedMoisture.label})
            </p>
          )}
        </div>
      )}

      {schedule && (
        <div className="schedule-card">
          <h3>Recommended Irrigation</h3>
          {schedule.usedEstimate && (
            <p className="schedule-note">Using estimated soil moisture: {schedule.estimatedMoisture}% (from weather).</p>
          )}
          <p>{schedule.message}</p>
          <strong>Duration: {schedule.duration}</strong>
          {schedule.tip && <p className="schedule-tip">💡 {schedule.tip}</p>}
        </div>
      )}
    </div>
  );
};

export default Irrigation;
