const express = require('express');
const MarketPrice = require('../models/MarketPrice');
const { syncRealTimeData, getRealTimeData } = require('../services/marketApiService');

const router = express.Router();

// @route   GET /api/market
// @desc    Get market prices with optional filters (state, district, date)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { state, district, date, crop, market, useRealtime } = req.query;

    // If useRealtime is true, try to fetch from external API first
    if (useRealtime === 'true') {
      try {
        // Build params object, only including defined and non-empty values
        const realtimeParams = {};
        if (state && state.trim()) realtimeParams.state = state.trim();
        if (district && district.trim()) realtimeParams.district = district.trim();
        if (crop && crop.trim()) realtimeParams.crop = crop.trim();
        if (market && market.trim()) realtimeParams.market = market.trim();
        
        const realtimeData = await getRealTimeData(realtimeParams);
        if (realtimeData && realtimeData.length > 0) {
          return res.status(200).json({
            success: true,
            count: realtimeData.length,
            data: realtimeData,
            source: 'external_api',
          });
        }
      } catch (error) {
        console.error('Error fetching real-time data, falling back to database:', error.message);
        // Fall through to database query
      }
    }

    // Build query for database
    const query = {};

    if (state) {
      query.state = new RegExp(state, 'i'); // Case-insensitive search
    }

    if (district) {
      query.district = new RegExp(district, 'i');
    }

    if (crop) {
      query.crop = new RegExp(crop, 'i');
    }

    if (market) {
      query.market = new RegExp(market, 'i');
    }

    if (date) {
      // If date is provided, search for that specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // If no date provided, get today's prices
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }

    const prices = await MarketPrice.find(query)
      .sort({ date: -1, price: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices,
      source: 'database',
    });
  } catch (error) {
    console.error('Get market prices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/states
// @desc    Get list of all states
// @access  Public
router.get('/states', async (req, res) => {
  try {
    const states = await MarketPrice.distinct('state');
    res.status(200).json({
      success: true,
      data: states.sort(),
    });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/districts
// @desc    Get list of districts for a state
// @access  Public
router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required',
      });
    }

    const districts = await MarketPrice.distinct('district', {
      state: new RegExp(state, 'i'),
    });

    res.status(200).json({
      success: true,
      data: districts.sort(),
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/crops
// @desc    Get list of all crops
// @access  Public
router.get('/crops', async (req, res) => {
  try {
    const crops = await MarketPrice.distinct('crop');
    res.status(200).json({
      success: true,
      data: crops.sort(),
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/markets
// @desc    Get list of markets (optionally filtered by state and district)
// @access  Public
router.get('/markets', async (req, res) => {
  try {
    const { state, district } = req.query;

    const query = {};
    if (state) {
      query.state = new RegExp(state, 'i');
    }
    if (district) {
      query.district = new RegExp(district, 'i');
    }

    const markets = await MarketPrice.distinct('market', query);
    res.status(200).json({
      success: true,
      data: markets.sort(),
    });
  } catch (error) {
    console.error('Get markets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/market
// @desc    Create/Update market price (for seeding data)
// @access  Public (should be protected in production)
router.post('/', async (req, res) => {
  try {
    const { crop, state, district, market, price, unit, date } = req.body;

    // Validation
    if (!crop || !state || !district || !market || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: crop, state, district, market, price',
      });
    }

    // Normalize state and district names (capitalize first letter of each word)
    const normalizeName = (name) => {
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const normalizedState = normalizeName(state);
    const normalizedDistrict = normalizeName(district);
    const normalizedCrop = normalizeName(crop);
    const normalizedMarket = normalizeName(market);

    const priceDate = date ? new Date(date) : new Date();
    priceDate.setHours(0, 0, 0, 0);

    // Check if price already exists for this combination
    const existingPrice = await MarketPrice.findOne({
      crop: normalizedCrop,
      state: normalizedState,
      district: normalizedDistrict,
      market: normalizedMarket,
      date: {
        $gte: new Date(priceDate),
        $lt: new Date(priceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingPrice) {
      // Update existing price
      existingPrice.price = price;
      existingPrice.lastUpdated = new Date();
      if (unit) existingPrice.unit = unit;
      await existingPrice.save();

      return res.status(200).json({
        success: true,
        message: 'Market price updated',
        data: existingPrice,
      });
    }

    // Create new price
    const marketPrice = await MarketPrice.create({
      crop: normalizedCrop,
      state: normalizedState,
      district: normalizedDistrict,
      market: normalizedMarket,
      price,
      unit: unit || 'Quintal',
      date: priceDate,
    });

    res.status(201).json({
      success: true,
      message: 'Market price created successfully',
      data: marketPrice,
    });
  } catch (error) {
    console.error('Create market price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/market/bulk
// @desc    Create multiple market prices at once
// @access  Public (should be protected in production)
router.post('/bulk', async (req, res) => {
  try {
    const { prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of prices',
      });
    }

    const normalizeName = (name) => {
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const item of prices) {
      try {
        const { crop, state, district, market, price, unit, date } = item;

        if (!crop || !state || !district || !market || !price) {
          results.errors.push({
            item,
            error: 'Missing required fields',
          });
          continue;
        }

        const normalizedState = normalizeName(state);
        const normalizedDistrict = normalizeName(district);
        const normalizedCrop = normalizeName(crop);
        const normalizedMarket = normalizeName(market);

        const priceDate = date ? new Date(date) : new Date();
        priceDate.setHours(0, 0, 0, 0);

        const existingPrice = await MarketPrice.findOne({
          crop: normalizedCrop,
          state: normalizedState,
          district: normalizedDistrict,
          market: normalizedMarket,
          date: {
            $gte: new Date(priceDate),
            $lt: new Date(priceDate.getTime() + 24 * 60 * 60 * 1000),
          },
        });

        if (existingPrice) {
          existingPrice.price = price;
          existingPrice.lastUpdated = new Date();
          if (unit) existingPrice.unit = unit;
          await existingPrice.save();
          results.updated++;
        } else {
          await MarketPrice.create({
            crop: normalizedCrop,
            state: normalizedState,
            district: normalizedDistrict,
            market: normalizedMarket,
            price,
            unit: unit || 'Quintal',
            date: priceDate,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          item,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk operation completed: ${results.created} created, ${results.updated} updated`,
      results,
    });
  } catch (error) {
    console.error('Bulk create market prices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/market/add-state
// @desc    Add a new state (by creating a sample market price entry)
// @access  Public (should be protected in production)
router.post('/add-state', async (req, res) => {
  try {
    const { stateName } = req.body;

    if (!stateName) {
      return res.status(400).json({
        success: false,
        message: 'State name is required',
      });
    }

    const normalizeName = (name) => {
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const normalizedState = normalizeName(stateName);

    // Check if state already exists
    const existingState = await MarketPrice.findOne({
      state: normalizedState,
    });

    if (existingState) {
      return res.status(200).json({
        success: true,
        message: 'State already exists in database',
        state: normalizedState,
        districts: await MarketPrice.distinct('district', { state: normalizedState }),
      });
    }

    // Get all states to return
    const allStates = await MarketPrice.distinct('state');
    allStates.push(normalizedState);

    res.status(200).json({
      success: true,
      message: 'State name added (will be available when market prices are added for this state)',
      state: normalizedState,
      allStates: allStates.sort(),
    });
  } catch (error) {
    console.error('Add state error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/market/add-district
// @desc    Add a new district for a state
// @access  Public (should be protected in production)
router.post('/add-district', async (req, res) => {
  try {
    const { stateName, districtName } = req.body;

    if (!stateName || !districtName) {
      return res.status(400).json({
        success: false,
        message: 'Both state name and district name are required',
      });
    }

    const normalizeName = (name) => {
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const normalizedState = normalizeName(stateName);
    const normalizedDistrict = normalizeName(districtName);

    // Check if district already exists for this state
    const existingDistrict = await MarketPrice.findOne({
      state: normalizedState,
      district: normalizedDistrict,
    });

    if (existingDistrict) {
      const districts = await MarketPrice.distinct('district', { state: normalizedState });
      return res.status(200).json({
        success: true,
        message: 'District already exists for this state',
        state: normalizedState,
        district: normalizedDistrict,
        allDistricts: districts.sort(),
      });
    }

    // Get all districts for this state
    const allDistricts = await MarketPrice.distinct('district', { state: normalizedState });
    allDistricts.push(normalizedDistrict);

    res.status(200).json({
      success: true,
      message: 'District name added (will be available when market prices are added for this district)',
      state: normalizedState,
      district: normalizedDistrict,
      allDistricts: allDistricts.sort(),
    });
  } catch (error) {
    console.error('Add district error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/states-with-districts
// @desc    Get all states with their districts
// @access  Public
router.get('/states-with-districts', async (req, res) => {
  try {
    const states = await MarketPrice.distinct('state');
    const result = {};

    for (const state of states) {
      const districts = await MarketPrice.distinct('district', { state });
      result[state] = districts.sort();
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get states with districts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   POST /api/market/sync-realtime
// @desc    Sync real-time data from external API to database
// @access  Public (should be protected in production)
router.post('/sync-realtime', async (req, res) => {
  try {
    const { state, district, crop } = req.body;

    const filters = {};
    if (state) filters.state = state;
    if (district) filters.district = district;
    if (crop) filters.crop = crop;

    const result = await syncRealTimeData(filters);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error('Sync real-time data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/market/realtime
// @desc    Get real-time market prices directly from external API
// @access  Public
router.get('/realtime', async (req, res) => {
  try {
    const { state, district, crop, market, limit = 100 } = req.query;

    // Build params object, only including defined and non-empty values
    const realtimeParams = {
      limit: parseInt(limit),
    };
    if (state && state.trim()) realtimeParams.state = state.trim();
    if (district && district.trim()) realtimeParams.district = district.trim();
    if (crop && crop.trim()) realtimeParams.crop = crop.trim();
    if (market && market.trim()) realtimeParams.market = market.trim();

    const realtimeData = await getRealTimeData(realtimeParams);

    res.status(200).json({
      success: true,
      count: realtimeData.length,
      data: realtimeData,
      source: 'external_api',
    });
  } catch (error) {
    console.error('Get real-time data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

