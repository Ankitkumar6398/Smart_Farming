const axios = require("axios");

// OpenWeatherMap API configuration
const API_KEY = process.env.WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// City name mappings for cities with known alternative names
const CITY_MAPPINGS = {
  "Allahabad": "Prayagraj",
  "Bangalore": "Bengaluru",
  "Mysore": "Mysuru",
  "Calcutta": "Kolkata",
  "Calicut": "Kozhikode",
  "Trivandrum": "Thiruvananthapuram",
  "Trichy": "Tiruchirappalli",
};

/**
 * Get current weather by city name
 */
const getCurrentWeather = async (city, countryCode = "in") => {
  try {
    if (!API_KEY) {
      return {
        success: false,
        message: "Weather API key not configured. Please set WEATHER_API_KEY in environment variables.",
      };
    }

    // Clean city name
    const cleanCity = city.trim();
    
    // Use mapped name if available, otherwise use original
    const cityName = CITY_MAPPINGS[cleanCity] || cleanCity;
    
    // Build query string: "City, Country"
    const queryString = `${cityName},${countryCode}`;

    // Make API call
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: queryString,
        appid: API_KEY,
        units: "metric",
      },
      timeout: 10000,
    });

    return {
      success: true,
      data: normalizeWeatherData(response.data),
    };
  } catch (error) {
    console.error("Weather API Error:", error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return {
        success: false,
        message: `City "${city}" not found. Please check the city name and try again.`,
      };
    }
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: "Invalid API key. Please configure WEATHER_API_KEY in your .env file.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to fetch weather data",
    };
  }
};

/**
 * Get weather by coordinates (latitude, longitude)
 */
const getWeatherByCoordinates = async (lat, lon) => {
  try {
    if (!API_KEY) {
      return {
        success: false,
        message: "Weather API key not configured. Please set WEATHER_API_KEY in environment variables.",
      };
    }

    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric",
      },
      timeout: 10000,
    });

    return {
      success: true,
      data: normalizeWeatherData(response.data),
    };
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return {
      success: false,
      message: error.message || "Failed to fetch weather data",
    };
  }
};

/**
 * Get 5-day weather forecast
 */
const getWeatherForecast = async (city, countryCode = "in") => {
  try {
    if (!API_KEY) {
      return {
        success: false,
        message: "Weather API key not configured. Please set WEATHER_API_KEY in environment variables.",
      };
    }

    // Clean city name
    const cleanCity = city.trim();
    
    // Use mapped name if available, otherwise use original
    const cityName = CITY_MAPPINGS[cleanCity] || cleanCity;
    
    // Build query string: "City, Country"
    const queryString = `${cityName},${countryCode}`;

    // Make API call
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: queryString,
        appid: API_KEY,
        units: "metric",
      },
      timeout: 10000,
    });

    return {
      success: true,
      data: {
        current: normalizeWeatherData(response.data.list[0]),
        forecast: response.data.list.slice(1, 6).map(normalizeWeatherData),
        city: response.data.city,
      },
    };
  } catch (error) {
    console.error("Weather Forecast API Error:", error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return {
        success: false,
        message: `City "${city}" not found. Please check the city name and try again.`,
      };
    }
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: "Invalid API key. Please configure WEATHER_API_KEY in your .env file.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to fetch weather forecast",
    };
  }
};

/**
 * Normalize weather data to a consistent format
 */
const normalizeWeatherData = (data) => {
  if (!data) return null;

  return {
    temperature: Math.round(data.main?.temp || 0),
    feelsLike: Math.round(data.main?.feels_like || 0),
    humidity: data.main?.humidity || 0,
    pressure: data.main?.pressure || 0,
    description: data.weather?.[0]?.description || "",
    main: data.weather?.[0]?.main || "",
    icon: data.weather?.[0]?.icon || "01d",
    windSpeed: data.wind?.speed || 0,
    windDirection: data.wind?.deg || 0,
    visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : null,
    cloudiness: data.clouds?.all || 0,
    city: data.name || "",
    country: data.sys?.country || "",
    sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : null,
    sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000) : null,
    date: data.dt ? new Date(data.dt * 1000) : new Date(),
    timezone: data.timezone || 0,
  };
};

module.exports = {
  getCurrentWeather,
  getWeatherByCoordinates,
  getWeatherForecast,
};
