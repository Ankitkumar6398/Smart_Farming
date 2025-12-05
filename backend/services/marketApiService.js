const axios = require("axios");
const MarketPrice = require("../models/MarketPrice");

// API config
const API_KEY =
  process.env.MARKET_API_KEY ||
  "579b464db66ec23bdd0000017e0bf52cad4d402f5c50c5bd578f6f93";

const API_URL =
  process.env.MARKET_API_BASE_URL ||
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

/**
 * Fetch live market prices
 */
const fetchRealTimeMarketData = async (params = {}) => {
  try {
    const state = params.state?.trim();
    const district = params.district?.trim();
    const crop = params.crop?.trim();
    const market = params.market?.trim();
    const limit = params.limit || 100;
    const offset = params.offset || 0;

    const apiParams = {
      "api-key": API_KEY,
      format: "json",
      limit,
      offset,
    };

    if (state) apiParams["filters[state]"] = state;
    if (district) apiParams["filters[district]"] = district;
    if (crop) apiParams["filters[commodity]"] = crop;
    if (market) apiParams["filters[market]"] = market;

    const response = await axios.get(API_URL, {
      params: apiParams,
      headers: { Accept: "application/json" },
      timeout: 15000,
    });

    const data = response.data;

    let records = data?.records || data?.data || data || [];

    if (!Array.isArray(records)) {
      const firstArrayKey = Object.keys(data || {}).find((key) =>
        Array.isArray(data[key])
      );
      records = firstArrayKey ? data[firstArrayKey] : [];
    }

    return normalizeApiData(records);
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
};

/**
 * Normalize API records
 */
const normalizeApiData = (records) => {
  const pick = (obj, ...keys) => {
    for (let key of keys) if (obj[key]) return obj[key];
    return null;
  };

  return records
    .map((rec) => {
      const crop = pick(
        rec,
        "commodity",
        "crop",
        "commodity_name",
        "commodity_name_hi"
      );

      const state = pick(rec, "state", "state_name");
      const district = pick(rec, "district", "district_name");
      const market = pick(rec, "market", "market_name", "mandi");

      const price = parseFloat(
        pick(
          rec,
          "modal_price",
          "price",
          "min_price",
          "max_price",
          "price_rs_quintal"
        )
      );

      const unit =
        pick(rec, "unit", "price_unit", "unit_en") || "Quintal";

      const dateStr = pick(rec, "date", "arrival_date", "price_date");
      const date = dateStr ? new Date(dateStr) : new Date();

      return {
        crop: crop ? String(crop).trim() : null,
        state: state ? String(state).trim() : null,
        district: district ? String(district).trim() : null,
        market: market ? String(market).trim() : null,
        price: price || 0,
        unit,
        date,
        lastUpdated: new Date(),
        source: "external_api",
      };
    })
    .filter((x) => x.price > 0 && x.crop && x.state && x.district);
};

/**
 * Sync data to database
 */
const syncRealTimeData = async (filters = {}) => {
  try {
    const apiData = await fetchRealTimeMarketData(filters);

    if (apiData.length === 0) {
      return { success: false, message: "No API data", created: 0, updated: 0 };
    }

    let created = 0,
      updated = 0;

    const formatName = (name) =>
      name
        ?.trim()
        ?.split(" ")
        ?.map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
        ?.join(" ");

    for (const item of apiData) {
      try {
        const state = formatName(item.state);
        const district = formatName(item.district);
        const crop = formatName(item.crop);
        const market = formatName(item.market);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await MarketPrice.findOne({
          crop,
          state,
          district,
          market,
          date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
        });

        if (existing) {
          existing.price = item.price;
          existing.unit = item.unit;
          existing.lastUpdated = new Date();
          await existing.save();
          updated++;
        } else {
          await MarketPrice.create({
            crop,
            state,
            district,
            market,
            price: item.price,
            unit: item.unit,
            date: today,
            lastUpdated: new Date(),
          });
          created++;
        }
      } catch (err) {
        console.error("DB Error:", err.message);
      }
    }

    return {
      success: true,
      message: "Sync complete",
      created,
      updated,
      total: apiData.length,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

/**
 * Return live data without saving
 */
const getRealTimeData = async (params = {}) => {
  return await fetchRealTimeMarketData(params);
};

module.exports = {
  fetchRealTimeMarketData,
  normalizeApiData,
  syncRealTimeData,
  getRealTimeData,
};
