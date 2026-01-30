const express = require('express');
const { getCurrentWeather, getWeatherByCoordinates, getWeatherForecast } = require('../services/weatherService');

const router = express.Router();

// @route   GET /api/weather
// @desc    Get current weather by city name
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, country = 'in' } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required',
      });
    }

    const result = await getCurrentWeather(city, country);

    if (!result.success) {
      const statusCode = result.message?.includes('API key') ? 500 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get weather error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/weather/coordinates
// @desc    Get current weather by coordinates
// @access  Public
router.get('/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude (lat) and longitude (lon) parameters are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Please provide valid numbers.',
      });
    }

    const result = await getWeatherByCoordinates(latitude, longitude);

    if (!result.success) {
      const statusCode = result.message?.includes('API key') ? 500 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get weather by coordinates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get 5-day weather forecast
// @access  Public
router.get('/forecast', async (req, res) => {
  try {
    const { city, country = 'in' } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required',
      });
    }

    const result = await getWeatherForecast(city, country);

    if (!result.success) {
      const statusCode = result.message?.includes('API key') ? 500 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;
