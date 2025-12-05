const axios = require('axios');
const MarketPrice = require('../models/MarketPrice');

// API Configuration
const MARKET_API_KEY = process.env.MARKET_API_KEY || '579b464db66ec23bdd0000017e0bf52cad4d402f5c50c5bd578f6f93';
// Try multiple possible API endpoints
const MARKET_API_BASE_URL = process.env.MARKET_API_BASE_URL || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const ALTERNATIVE_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Fetch real-time market prices from external API
 * @param {Object} params - Query parameters (state, district, crop, etc.)
 * @returns {Promise<Array>} Array of market price data
 */
const fetchRealTimeMarketData = async (params = {}) => {
  try {
    // Extract and validate parameters
    const state = params.state && params.state.trim() ? params.state.trim() : undefined;
    const district = params.district && params.district.trim() ? params.district.trim() : undefined;
    const crop = params.crop && params.crop.trim() ? params.crop.trim() : undefined;
    const market = params.market && params.market.trim() ? params.market.trim() : undefined;
    const limit = params.limit || 100;
    const offset = params.offset || 0;

    // Only log non-undefined params
    const logParams = {};
    if (state) logParams.state = state;
    if (district) logParams.district = district;
    if (crop) logParams.crop = crop;
    if (market) logParams.market = market;
    logParams.limit = limit;
    logParams.offset = offset;

    console.log('🔍 Fetching real-time market data with params:', logParams);
    console.log('🔑 Using API Key:', MARKET_API_KEY.substring(0, 20) + '...');
    console.log('🌐 API URL:', MARKET_API_BASE_URL);

    // Build API request parameters
    // data.gov.in API format
    const apiParams = {
      'api-key': MARKET_API_KEY,
      format: 'json',
      limit: limit,
      offset: offset,
    };

    // Add filters if provided - data.gov.in uses filters[field_name] format
    // Only add filters that have actual values
    if (state) {
      apiParams['filters[state]'] = state;
    }
    if (district) {
      apiParams['filters[district]'] = district;
    }
    if (crop) {
      // Try multiple field names for crop/commodity
      apiParams['filters[commodity]'] = crop;
    }
    if (market) {
      apiParams['filters[market]'] = market;
    }

    // Make API request - try primary URL first
    let response;
    try {
      console.log('📡 Making API request to:', MARKET_API_BASE_URL);
      console.log('📋 Request params:', JSON.stringify(apiParams, null, 2));
      
      response = await axios.get(MARKET_API_BASE_URL, {
        params: apiParams,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Smart-Farming-App/1.0',
        },
        timeout: 15000, // 15 seconds timeout
      });
      
      console.log('✅ API Response received. Status:', response.status);
      console.log('📦 Response data keys:', Object.keys(response.data || {}));
    } catch (error) {
      console.error('❌ Primary API request failed:', error.message);
      
      // Log detailed error information
      if (error.response) {
        console.error('📊 Response Status:', error.response.status);
        console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('📊 Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('📊 No response received. Request:', error.request);
      }
      
      // Try alternative URL if primary fails
      console.log('🔄 Trying alternative API URL...');
      try {
        response = await axios.get(ALTERNATIVE_API_URL, {
          params: apiParams,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Smart-Farming-App/1.0',
          },
          timeout: 15000,
        });
        console.log('✅ Alternative API succeeded');
      } catch (altError) {
        console.error('❌ Alternative API also failed:', altError.message);
        throw error; // Throw original error
      }
    }

    // Parse and normalize the response
    // Handle different response formats
    let records = [];
    
    console.log('🔍 Parsing API response...');
    console.log('📦 Response structure:', JSON.stringify(response.data, null, 2).substring(0, 500));
    
    if (response.data) {
      // Format 1: { records: [...] } - data.gov.in standard format
      if (response.data.records && Array.isArray(response.data.records)) {
        records = response.data.records;
        console.log(`✅ Found ${records.length} records in response.data.records`);
      }
      // Format 2: Direct array
      else if (Array.isArray(response.data)) {
        records = response.data;
        console.log(`✅ Found ${records.length} records as direct array`);
      }
      // Format 3: { data: { records: [...] } }
      else if (response.data.data && response.data.data.records) {
        records = response.data.data.records;
        console.log(`✅ Found ${records.length} records in response.data.data.records`);
      }
      // Format 4: { data: [...] }
      else if (response.data.data && Array.isArray(response.data.data)) {
        records = response.data.data;
        console.log(`✅ Found ${records.length} records in response.data.data`);
      }
      // Format 5: Check for other possible structures
      else {
        console.warn('⚠️ Unknown response format. Available keys:', Object.keys(response.data));
        // Try to find any array in the response
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            records = response.data[key];
            console.log(`✅ Found ${records.length} records in response.data.${key}`);
            break;
          }
        }
      }
    }

    if (records.length > 0) {
      console.log(`📊 Normalizing ${records.length} records...`);
      const normalized = normalizeApiData(records);
      console.log(`✅ Successfully normalized ${normalized.length} records`);
      return normalized;
    }

    console.warn('⚠️ No records found in API response');
    return [];
  } catch (error) {
    console.error('❌ Error fetching real-time market data:', error.message);
    
    // If it's a specific API error, log detailed information
    if (error.response) {
      console.error('📊 API Error Status:', error.response.status);
      console.error('📊 API Error Headers:', error.response.headers);
      console.error('📊 API Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📊 No response received from API');
      console.error('📊 Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
      });
    } else {
      console.error('📊 Error setting up request:', error.message);
    }

    // Return empty array on error (fallback to database data)
    console.log('⚠️ Returning empty array, will fallback to database');
    return [];
  }
};

/**
 * Normalize API response data to match our MarketPrice schema
 * @param {Array} records - Raw API records
 * @returns {Array} Normalized market price data
 */
const normalizeApiData = (records) => {
  return records.map(record => {
    // Handle different field name variations from API
    // Try multiple possible field names
    const getField = (record, ...possibleNames) => {
      for (const name of possibleNames) {
        if (record[name] !== undefined && record[name] !== null && record[name] !== '') {
          return record[name];
        }
      }
      return null;
    };

    // Extract fields with fallbacks
    const crop = getField(record, 'commodity', 'crop', 'commodity_name', 'commodity_name_hi', 'commodity_name_en') || 'Unknown';
    const state = getField(record, 'state', 'state_name', 'state_name_hi', 'state_name_en') || 'Unknown';
    const district = getField(record, 'district', 'district_name', 'district_name_hi', 'district_name_en') || 'Unknown';
    const market = getField(record, 'market', 'market_name', 'market_name_hi', 'market_name_en', 'mandi', 'mandi_name') || 'Unknown';
    
    // Try to extract price from various fields
    const priceStr = getField(record, 'modal_price', 'price', 'min_price', 'max_price', 'modal_price_rs_quintal', 'price_rs_quintal');
    const price = priceStr ? parseFloat(priceStr) : 0;
    
    // Extract unit
    const unit = getField(record, 'price_unit', 'unit', 'unit_hi', 'unit_en') || 'Quintal';
    
    // Extract date
    const dateStr = getField(record, 'date', 'price_date', 'arrival_date', 'date_of_arrival');
    const date = dateStr ? new Date(dateStr) : new Date();

    return {
      crop: String(crop).trim(),
      state: String(state).trim(),
      district: String(district).trim(),
      market: String(market).trim(),
      price: price,
      unit: String(unit).trim() || 'Quintal',
      date: date,
      lastUpdated: new Date(),
      source: 'external_api',
      apiData: record, // Store original for debugging
    };
  }).filter(item => {
    // Filter out invalid records
    return item.price > 0 && 
           item.crop !== 'Unknown' && 
           item.state !== 'Unknown' && 
           item.district !== 'Unknown';
  });
};

/**
 * Sync real-time data from API to database
 * @param {Object} filters - Optional filters (state, district, crop)
 * @returns {Promise<Object>} Sync results
 */
const syncRealTimeData = async (filters = {}) => {
  try {
    console.log('Fetching real-time market data from API...');
    const apiData = await fetchRealTimeMarketData(filters);

    if (apiData.length === 0) {
      return {
        success: false,
        message: 'No data received from API',
        created: 0,
        updated: 0,
      };
    }

    let created = 0;
    let updated = 0;
    const errors = [];

    // Normalize name helper
    const normalizeName = (name) => {
      if (!name) return '';
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    for (const item of apiData) {
      try {
        const normalizedState = normalizeName(item.state);
        const normalizedDistrict = normalizeName(item.district);
        const normalizedCrop = normalizeName(item.crop);
        const normalizedMarket = normalizeName(item.market);

        // Use today's date for the price
        const priceDate = new Date();
        priceDate.setHours(0, 0, 0, 0);

        // Check if price already exists
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
          existingPrice.price = item.price;
          existingPrice.lastUpdated = new Date();
          existingPrice.unit = item.unit || existingPrice.unit;
          existingPrice.source = 'external_api';
          await existingPrice.save();
          updated++;
        } else {
          // Create new price
          await MarketPrice.create({
            crop: normalizedCrop,
            state: normalizedState,
            district: normalizedDistrict,
            market: normalizedMarket,
            price: item.price,
            unit: item.unit || 'Quintal',
            date: priceDate,
            lastUpdated: new Date(),
            source: 'external_api',
          });
          created++;
        }
      } catch (error) {
        errors.push({
          item,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: `Synced ${apiData.length} records: ${created} created, ${updated} updated`,
      created,
      updated,
      total: apiData.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error syncing real-time data:', error);
    return {
      success: false,
      message: error.message || 'Error syncing data',
      created: 0,
      updated: 0,
    };
  }
};

/**
 * Fetch and return real-time data without saving to database
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Real-time market data
 */
const getRealTimeData = async (params = {}) => {
  try {
    const apiData = await fetchRealTimeMarketData(params);
    return apiData;
  } catch (error) {
    console.error('Error getting real-time data:', error);
    return [];
  }
};

module.exports = {
  fetchRealTimeMarketData,
  syncRealTimeData,
  getRealTimeData,
  normalizeApiData,
};

