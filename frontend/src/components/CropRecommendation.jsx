import React, { useState } from "react";
import "../styles/CropRecommendation.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CROP_DATABASE = [
  {
    id: "rice",
    name: "Rice",
    nameHi: "धान",
    tempMin: 20,
    tempMax: 35,
    humidityMin: 60,
    season: "Kharif",
    desc: "Suitable for high rainfall and humid areas. Needs standing water in early stage.",
  },
  {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    tempMin: 10,
    tempMax: 25,
    humidityMin: 40,
    humidityMax: 70,
    season: "Rabi",
    desc: "Best in cool, dry winters. Grown in north and central India.",
  },
  {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    tempMin: 21,
    tempMax: 32,
    humidityMin: 50,
    season: "Kharif",
    desc: "Warm season crop. Needs moderate rainfall and well-drained soil.",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    tempMin: 20,
    tempMax: 35,
    humidityMin: 55,
    season: "Year-round",
    desc: "Tropical crop. Needs high water and long warm season.",
  },
  {
    id: "maize",
    name: "Maize",
    nameHi: "मक्का",
    tempMin: 18,
    tempMax: 32,
    humidityMin: 45,
    season: "Kharif",
    desc: "Warm season crop. Grows well in moderate to high rainfall.",
  },
  {
    id: "pulses",
    name: "Pulses (Moong, Urad, etc.)",
    nameHi: "दालें",
    tempMin: 20,
    tempMax: 30,
    humidityMin: 40,
    humidityMax: 75,
    season: "Kharif / Rabi",
    desc: "Legumes. Need moderate temperature and less water than rice.",
  },
  {
    id: "mustard",
    name: "Mustard",
    nameHi: "सरसों",
    tempMin: 10,
    tempMax: 28,
    humidityMin: 35,
    season: "Rabi",
    desc: "Cool season oilseed. Suited to north Indian winters.",
  },
  {
    id: "bajra",
    name: "Bajra (Pearl Millet)",
    nameHi: "बाजरा",
    tempMin: 25,
    tempMax: 35,
    humidityMin: 30,
    humidityMax: 65,
    season: "Kharif",
    desc: "Drought-resistant. Good for hot, dry and semi-arid regions.",
  },
  {
    id: "jowar",
    name: "Jowar (Sorghum)",
    nameHi: "ज्वार",
    tempMin: 25,
    tempMax: 32,
    humidityMin: 35,
    season: "Kharif",
    desc: "Heat-tolerant. Grows in low to moderate rainfall areas.",
  },
  {
    id: "groundnut",
    name: "Groundnut",
    nameHi: "मूंगफली",
    tempMin: 22,
    tempMax: 33,
    humidityMin: 50,
    season: "Kharif",
    desc: "Warm season. Needs well-drained soil and moderate rain.",
  },
  {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    tempMin: 20,
    tempMax: 30,
    humidityMin: 50,
    season: "Kharif",
    desc: "Moderate temp and good rainfall. Major in MP, Maharashtra.",
  },
  {
    id: "potato",
    name: "Potato",
    nameHi: "आलू",
    tempMin: 15,
    tempMax: 25,
    humidityMin: 60,
    season: "Rabi / Cool",
    desc: "Cool season crop. Needs cool nights and moderate water.",
  },
];

const CropRecommendation = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
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

  const getRecommendations = (temp, humidity) => {
    return CROP_DATABASE.filter((crop) => {
      const tempOk = temp >= crop.tempMin && temp <= crop.tempMax;
      const humOk =
        humidity >= (crop.humidityMin || 0) &&
        (crop.humidityMax == null || humidity <= crop.humidityMax);
      return tempOk && humOk;
    });
  };

  const handleGetRecommendations = async () => {
    if (!city?.trim()) {
      alert("Please enter your city/location.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setRecommendations([]);

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

      const data = result.data;
      const temp = data.temperature ?? 25;
      const humidity = data.humidity ?? 50;

      setWeather(data);
      const recs = getRecommendations(temp, humidity);
      setRecommendations(recs.length > 0 ? recs : getRecommendations(22, 55));
    } catch (err) {
      setError(err.message || "Failed to fetch weather. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-rec-container">
      <h1>🌾 Crop Recommendation</h1>
      <p>
        Get crop suggestions based on your location’s current weather (temperature & humidity).
        Enter your city to see suitable crops.
      </p>

      <div className="crop-rec-form">
        <input
          type="text"
          placeholder="Enter your city (e.g. Delhi, Pune, Patna)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleGetRecommendations} disabled={loading}>
          {loading ? "Checking weather…" : "Get Crop Recommendations"}
        </button>
      </div>

      {error && (
        <div className="crop-rec-error">⚠️ {error}</div>
      )}

      {weather && (
        <div className="crop-rec-weather">
          <h3>🌤️ Current Weather — {weather.city}</h3>
          <p>
            {weather.temperature}°C, {weather.humidity}% humidity · {weather.description}
          </p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="crop-rec-list">
          <h3>✅ Recommended Crops for Your Area</h3>
          <p className="crop-rec-subtext">
            Based on current temperature ({weather?.temperature}°C) and humidity ({weather?.humidity}%).
          </p>
          <div className="crop-rec-grid">
            {recommendations.map((crop) => (
              <div key={crop.id} className="crop-rec-card">
                <h4>{crop.name}</h4>
                {crop.nameHi && <span className="crop-name-hi">{crop.nameHi}</span>}
                <p className="crop-season">{crop.season}</p>
                <p className="crop-desc">{crop.desc}</p>
                <p className="crop-temp">
                  Ideal temp: {crop.tempMin}–{crop.tempMax}°C
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
