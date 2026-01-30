import React, { useState, useEffect } from "react";
import "../styles/Weather.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLocation, setUseLocation] = useState(false);

  // Default cities for quick selection
  const defaultCities = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Kolkata",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Varanasi",
    "Srinagar",
    "Amritsar",
    "Chandigarh",
    "Coimbatore",
    "Madurai",
    "Surat",
    "Jodhpur",
    "Raipur",
    "Bhubaneswar",
    "Mysore",
    "Mangalore",
    "Kochi",
    "Thiruvananthapuram",
    "Guwahati",
    "Shimla",
    "Dehradun",
    "Ranchi",
    "Jamshedpur",
    "Bareilly",
    "Gorakhpur",
    "Allahabad",
    "Gwalior",
    "Vijayawada",
    "Tiruchirappalli",
    "Salem",
  ];

  useEffect(() => {
    // Try to get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (err) => {
          console.log("Location access denied or unavailable");
        }
      );
    }
  }, []);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);
    setForecastData(null);

    try {
      // Fetch current weather
      const currentRes = await fetch(
        `${API_URL}/api/weather?city=${encodeURIComponent(cityName.trim())}&country=in`
      );

      // Get response text first to check if it's JSON
      const responseText = await currentRes.text();
      
      // Try to parse as JSON
      let currentJson;
      try {
        currentJson = JSON.parse(responseText);
      } catch (parseError) {
        // If parsing fails, it's likely HTML (404 page or error page)
        if (currentRes.status === 404) {
          setError(`API endpoint not found. Please check if the backend server is running at ${API_URL}`);
        } else {
          setError(`Server returned invalid response. Please check if the backend is running correctly at ${API_URL}`);
        }
        setLoading(false);
        return;
      }

      if (!currentJson.success) {
        setError(currentJson.message || "Failed to fetch weather data");
        setLoading(false);
        return;
      }

      setWeatherData(currentJson.data);

      // Fetch forecast (optional, don't show error if it fails)
      try {
        const forecastRes = await fetch(
          `${API_URL}/api/weather/forecast?city=${encodeURIComponent(cityName.trim())}&country=in`
        );
        
        const forecastText = await forecastRes.text();
        try {
          const forecastJson = JSON.parse(forecastText);
          if (forecastJson.success) {
            setForecastData(forecastJson.data);
          }
        } catch (parseErr) {
          // Silently ignore forecast parse errors
          console.log("Forecast not available");
        }
      } catch (forecastErr) {
        console.log("Forecast not available");
      }
    } catch (err) {
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(`Cannot connect to server at ${API_URL}. Please make sure the backend is running.`);
      } else if (err.message && (err.message.includes("JSON") || err.message.includes("DOCTYPE"))) {
        setError(`Server returned invalid response. Please check if the backend is running at ${API_URL}`);
      } else {
        setError(err.message || "Failed to fetch weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoordinates = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const res = await fetch(
        `${API_URL}/api/weather/coordinates?lat=${lat}&lon=${lon}`
      );

      // Get response text first to check if it's JSON
      const responseText = await res.text();
      
      // Try to parse as JSON
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        // If parsing fails, it's likely HTML (404 page or error page)
        if (res.status === 404) {
          setError(`API endpoint not found. Please check if the backend server is running at ${API_URL}`);
        } else {
          setError(`Server returned invalid response. Please check if the backend is running correctly at ${API_URL}`);
        }
        setLoading(false);
        return;
      }

      if (!json.success) {
        setError(json.message || "Failed to fetch weather data");
        setLoading(false);
        return;
      }

      setWeatherData(json.data);
      setCity(json.data.city || "");
    } catch (err) {
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(`Cannot connect to server at ${API_URL}. Please make sure the backend is running.`);
      } else if (err.message && (err.message.includes("JSON") || err.message.includes("DOCTYPE"))) {
        setError(`Server returned invalid response. Please check if the backend is running at ${API_URL}`);
      } else {
        setError(err.message || "Failed to fetch weather data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const handleCityClick = (cityName) => {
    setCity(cityName);
    fetchWeather(cityName);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getWindDirection = (degrees) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h1>🌤️ Weather Forecast</h1>
        <p>Get real-time weather information for your farming needs</p>
      </div>

      {/* Search Section */}
      <div className="weather-search-section">
        <form onSubmit={handleSubmit} className="weather-search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name (e.g., Delhi, Mumbai)"
              className="weather-search-input"
            />
            <button type="submit" className="weather-search-btn" disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>

        {/* Quick City Selection */}
        <div className="quick-cities">
          <span className="quick-cities-label">Quick select:</span>
          <div className="quick-cities-buttons">
            {defaultCities.map((cityName) => (
              <button
                key={cityName}
                onClick={() => handleCityClick(cityName)}
                className="quick-city-btn"
                disabled={loading}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="weather-error">
          <span>⚠️</span> 
          <div>
            <div style={{ marginBottom: '8px' }}>{error}</div>
            {error.includes('API key') || error.includes('WEATHER_API_KEY') ? (
              <div style={{ fontSize: '0.9rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(133, 100, 4, 0.3)' }}>
                <strong>Setup Instructions:</strong>
                <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" style={{ color: '#856404', textDecoration: 'underline' }}>OpenWeatherMap</a></li>
                  <li>Add <code style={{ background: 'rgba(133, 100, 4, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>WEATHER_API_KEY=your-api-key</code> to your backend <code style={{ background: 'rgba(133, 100, 4, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>.env</code> file</li>
                  <li>Restart your backend server</li>
                </ol>
              </div>
            ) : error.includes('Cannot connect') || error.includes('server is running') ? (
              <div style={{ fontSize: '0.9rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(133, 100, 4, 0.3)' }}>
                <strong>Quick Fix:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Make sure the backend server is running</li>
                  <li>Check if the server is running on {API_URL}</li>
                  <li>Run <code style={{ background: 'rgba(133, 100, 4, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>npm run dev</code> in the backend directory</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="weather-loading">
          <div className="weather-spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}

      {/* Current Weather */}
      {!loading && weatherData && (
        <div className="weather-content">
          <div className="current-weather-card">
            <div className="weather-location">
              <h2>
                {weatherData.city}, {weatherData.country}
              </h2>
              <p className="weather-date">{formatDate(weatherData.date)}</p>
            </div>

            <div className="weather-main-info">
              <div className="weather-temp-section">
                <div className="weather-icon-container">
                  <img
                    src={getWeatherIcon(weatherData.icon)}
                    alt={weatherData.description}
                    className="weather-icon"
                  />
                </div>
                <div className="weather-temp">
                  <span className="temp-value">{weatherData.temperature}°C</span>
                  <span className="temp-feels">
                    Feels like {weatherData.feelsLike}°C
                  </span>
                </div>
              </div>

              <div className="weather-description">
                <h3>{weatherData.description}</h3>
                <p className="weather-main-type">{weatherData.main}</p>
              </div>
            </div>

            <div className="weather-details-grid">
              <div className="weather-detail-item">
                <span className="detail-icon">💧</span>
                <div className="detail-info">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weatherData.humidity}%</span>
                </div>
              </div>

              <div className="weather-detail-item">
                <span className="detail-icon">🌬️</span>
                <div className="detail-info">
                  <span className="detail-label">Wind Speed</span>
                  <span className="detail-value">
                    {weatherData.windSpeed} m/s {getWindDirection(weatherData.windDirection)}
                  </span>
                </div>
              </div>

              <div className="weather-detail-item">
                <span className="detail-icon">📊</span>
                <div className="detail-info">
                  <span className="detail-label">Pressure</span>
                  <span className="detail-value">{weatherData.pressure} hPa</span>
                </div>
              </div>

              <div className="weather-detail-item">
                <span className="detail-icon">☁️</span>
                <div className="detail-info">
                  <span className="detail-label">Cloudiness</span>
                  <span className="detail-value">{weatherData.cloudiness}%</span>
                </div>
              </div>

              {weatherData.visibility && (
                <div className="weather-detail-item">
                  <span className="detail-icon">👁️</span>
                  <div className="detail-info">
                    <span className="detail-label">Visibility</span>
                    <span className="detail-value">{weatherData.visibility} km</span>
                  </div>
                </div>
              )}

              {weatherData.sunrise && (
                <div className="weather-detail-item">
                  <span className="detail-icon">🌅</span>
                  <div className="detail-info">
                    <span className="detail-label">Sunrise</span>
                    <span className="detail-value">{formatTime(weatherData.sunrise)}</span>
                  </div>
                </div>
              )}

              {weatherData.sunset && (
                <div className="weather-detail-item">
                  <span className="detail-icon">🌇</span>
                  <div className="detail-info">
                    <span className="detail-label">Sunset</span>
                    <span className="detail-value">{formatTime(weatherData.sunset)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Forecast Section */}
          {forecastData && forecastData.forecast && (
            <div className="forecast-section">
              <h3>5-Day Forecast</h3>
              <div className="forecast-cards">
                {forecastData.forecast.map((item, index) => (
                  <div key={index} className="forecast-card">
                    <div className="forecast-date">{formatDate(item.date)}</div>
                    <img
                      src={getWeatherIcon(item.icon)}
                      alt={item.description}
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">
                      <span className="forecast-temp-high">{item.temperature}°C</span>
                    </div>
                    <div className="forecast-desc">{item.description}</div>
                    <div className="forecast-details">
                      <span>💧 {item.humidity}%</span>
                      <span>🌬️ {item.windSpeed} m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farming Recommendations */}
          <div className="farming-recommendations">
            <h3>🌾 Farming Recommendations</h3>
            <div className="recommendations-grid">
              {weatherData.temperature > 35 && (
                <div className="recommendation-card warning">
                  <span className="rec-icon">⚠️</span>
                  <div>
                    <strong>High Temperature Alert</strong>
                    <p>Consider irrigation during early morning or evening to prevent water loss.</p>
                  </div>
                </div>
              )}
              
              {weatherData.humidity < 40 && (
                <div className="recommendation-card info">
                  <span className="rec-icon">💧</span>
                  <div>
                    <strong>Low Humidity</strong>
                    <p>Increase irrigation frequency. Monitor soil moisture levels closely.</p>
                  </div>
                </div>
              )}

              {weatherData.windSpeed > 5 && (
                <div className="recommendation-card warning">
                  <span className="rec-icon">🌬️</span>
                  <div>
                    <strong>Strong Winds</strong>
                    <p>Avoid spraying pesticides. Secure greenhouse structures if applicable.</p>
                  </div>
                </div>
              )}

              {weatherData.rain && (
                <div className="recommendation-card success">
                  <span className="rec-icon">🌧️</span>
                  <div>
                    <strong>Rain Expected</strong>
                    <p>Postpone irrigation. Check drainage systems. Protect sensitive crops.</p>
                  </div>
                </div>
              )}

              {weatherData.temperature >= 20 && weatherData.temperature <= 30 && weatherData.humidity >= 50 && (
                <div className="recommendation-card success">
                  <span className="rec-icon">✅</span>
                  <div>
                    <strong>Ideal Conditions</strong>
                    <p>Perfect weather for crop growth. Good time for planting and field activities.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
