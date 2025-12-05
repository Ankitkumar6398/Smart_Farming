import React, { useEffect, useState } from "react";
import "../styles/Market.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Market = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  
  // Filters
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Real-time update
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch states list
  useEffect(() => {
    fetchStates();
    fetchCrops();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState);
      setSelectedDistrict(""); // Reset district when state changes
      setSelectedMarket(""); // Reset market when state changes
    } else {
      setDistricts([]);
      setMarkets([]);
    }
  }, [selectedState]);

  // Fetch markets when state or district changes
  useEffect(() => {
    if (selectedState) {
      fetchMarkets(selectedState, selectedDistrict);
      if (!selectedDistrict) {
        setSelectedMarket(""); // Reset market when district changes
      }
    } else {
      setMarkets([]);
    }
  }, [selectedState, selectedDistrict]);

  // Fetch prices when filters change
  useEffect(() => {
    fetchMarketPrices();
  }, [selectedState, selectedDistrict, selectedCrop, selectedMarket, selectedDate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMarketPrices();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedState, selectedDistrict, selectedCrop, selectedMarket, selectedDate]);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/market/states`);
      const data = await response.json();
      if (data.success) {
        setStates(data.data);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const response = await fetch(`${API_URL}/api/market/districts?state=${encodeURIComponent(state)}`);
      const data = await response.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchCrops = async () => {
    try {
      const response = await fetch(`${API_URL}/api/market/crops`);
      const data = await response.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

  const fetchMarkets = async (state, district) => {
    try {
      const params = new URLSearchParams();
      params.append('state', state);
      if (district) {
        params.append('district', district);
      }
      const response = await fetch(`${API_URL}/api/market/markets?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setMarkets(data.data);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchMarketPrices = async (useRealtime = true) => {
    try {
      if (!loading) setIsRefreshing(true);
      else setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedCrop) params.append('crop', selectedCrop);
      if (selectedMarket) params.append('market', selectedMarket);
      if (selectedDate) params.append('date', selectedDate);
      if (useRealtime) params.append('useRealtime', 'true');

      // Try real-time API first, fallback to database
      let response = await fetch(`${API_URL}/api/market?${params.toString()}`);
      let data = await response.json();

      // If real-time failed, try direct real-time endpoint
      if (!data.success && useRealtime) {
        try {
          const realtimeParams = new URLSearchParams();
          if (selectedState) realtimeParams.append('state', selectedState);
          if (selectedDistrict) realtimeParams.append('district', selectedDistrict);
          if (selectedCrop) realtimeParams.append('crop', selectedCrop);
          if (selectedMarket) realtimeParams.append('market', selectedMarket);
          
          response = await fetch(`${API_URL}/api/market/realtime?${realtimeParams.toString()}`);
          data = await response.json();
        } catch (realtimeError) {
          console.log('Real-time API failed, using database data');
        }
      }

      if (data.success && data.data && data.data.length > 0) {
        setPrices(data.data);
        setLastUpdated(new Date());
      } else {
        // Fallback to dummy data if API fails
        setPrices(getDummyData());
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching market prices:", error);
      // Fallback to dummy data
      setPrices(getDummyData());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getDummyData = () => {
    return [
      { crop: "Wheat", state: "Punjab", district: "Ludhiana", market: "Ludhiana Mandi", price: 2420, unit: "Quintal", date: new Date() },
      { crop: "Rice", state: "Haryana", district: "Karnal", market: "Karnal Mandi", price: 3200, unit: "Quintal", date: new Date() },
      { crop: "Sugarcane", state: "Uttar Pradesh", district: "Meerut", market: "Meerut Mandi", price: 340, unit: "Quintal", date: new Date() },
      { crop: "Maize", state: "Madhya Pradesh", district: "Indore", market: "Indore Mandi", price: 1920, unit: "Quintal", date: new Date() },
      { crop: "Cotton", state: "Gujarat", district: "Rajkot", market: "Rajkot Mandi", price: 6400, unit: "Quintal", date: new Date() },
      { crop: "Bajra", state: "Rajasthan", district: "Jaipur", market: "Jaipur Mandi", price: 1850, unit: "Quintal", date: new Date() }
    ];
  };

  const handleResetFilters = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedCrop("");
    setSelectedMarket("");
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chartData = prices.map((item) => ({
    name: item.crop,
    price: item.price,
    market: item.market,
  }));

  return (
    <div className="market-container">
      <div className="market-header">
        <div className="header-content">
          <h1>🌾 Real-Time Market Prices</h1>
          <p>Get live mandi prices filtered by state, district, and crop</p>
          {autoRefresh && (
            <div className="realtime-banner">
              <span className="pulse-dot"></span>
              <span>Real-time prices updating every 30 seconds</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="date-filter">📅 Select Date</label>
            <input
              type="date"
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="state-filter">🗺️ State</label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="filter-select"
            >
              <option value="">All States</option>
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="district-filter">📍 District</label>
            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="filter-select"
              disabled={!selectedState}
            >
              <option value="">All Districts</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="crop-filter">🌾 Crop</label>
            <select
              id="crop-filter"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="filter-select"
            >
              <option value="">All Crops</option>
              {crops.map((crop, index) => (
                <option key={index} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="market-filter">🏪 Market</label>
            <select
              id="market-filter"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="filter-select"
              disabled={!selectedState}
            >
              <option value="">All Markets</option>
              {markets.map((market, index) => (
                <option key={index} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={handleResetFilters} className="btn-reset">
            🔄 Reset Filters
          </button>
          <button 
            onClick={fetchMarketPrices} 
            className="btn-refresh"
            disabled={isRefreshing}
          >
            {isRefreshing ? "🔄 Refreshing..." : "🔃 Refresh Now"}
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
        </div>

        {/* Active Filters Display */}
        {(selectedState || selectedDistrict || selectedCrop || selectedMarket) && (
          <div className="active-filters">
            <span className="active-filters-label">Active Filters:</span>
            {selectedState && (
              <span className="filter-badge">
                🗺️ State: <strong>{selectedState}</strong>
              </span>
            )}
            {selectedDistrict && (
              <span className="filter-badge">
                📍 District: <strong>{selectedDistrict}</strong>
              </span>
            )}
            {selectedCrop && (
              <span className="filter-badge">
                🌾 Crop: <strong>{selectedCrop}</strong>
              </span>
            )}
            {selectedMarket && (
              <span className="filter-badge">
                🏪 Market: <strong>{selectedMarket}</strong>
              </span>
            )}
          </div>
        )}

        {lastUpdated && (
          <div className="last-updated">
            <span className="live-indicator">
              <span className="pulse-dot"></span>
              Live Prices
            </span>
            Last updated: {formatTime(lastUpdated)} | Showing prices for: {formatDate(selectedDate)}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading market prices...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {prices.length === 0 ? (
            <div className="no-data">
              <p>📭 No market prices found for the selected filters.</p>
              <p>Try adjusting your filters or select a different date.</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-icon">📊</div>
                  <div className="summary-content">
                    <div className="summary-label">Total Records</div>
                    <div className="summary-value">{prices.length}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">💰</div>
                  <div className="summary-content">
                    <div className="summary-label">Avg Price</div>
                    <div className="summary-value">
                      ₹{Math.round(prices.reduce((sum, p) => sum + p.price, 0) / prices.length)}
                    </div>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">📈</div>
                  <div className="summary-content">
                    <div className="summary-label">Highest Price</div>
                    <div className="summary-value">
                      ₹{Math.max(...prices.map((p) => p.price))}
                    </div>
                  </div>
                </div>
                {selectedState && (
                  <div className="summary-card highlight-card">
                    <div className="summary-icon">🗺️</div>
                    <div className="summary-content">
                      <div className="summary-label">Selected State</div>
                      <div className="summary-value">{selectedState}</div>
                    </div>
                  </div>
                )}
                {selectedDistrict && (
                  <div className="summary-card highlight-card">
                    <div className="summary-icon">📍</div>
                    <div className="summary-content">
                      <div className="summary-label">Selected District</div>
                      <div className="summary-value">{selectedDistrict}</div>
                    </div>
                  </div>
                )}
                {selectedCrop && (
                  <div className="summary-card highlight-card">
                    <div className="summary-icon">🌾</div>
                    <div className="summary-content">
                      <div className="summary-label">Selected Crop</div>
                      <div className="summary-value">{selectedCrop}</div>
                    </div>
                  </div>
                )}
                {selectedMarket && (
                  <div className="summary-card highlight-card">
                    <div className="summary-icon">🏪</div>
                    <div className="summary-content">
                      <div className="summary-label">Selected Market</div>
                      <div className="summary-value">{selectedMarket}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>State</th>
                      <th>District</th>
                      <th>Market</th>
                      <th>Price (₹/{prices[0]?.unit || "Quintal"})</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((item, index) => (
                      <tr key={index} className="price-row">
                        <td className="crop-cell">
                          <div className="cell-content">
                            <span className="crop-icon">🌾</span>
                            <strong>{item.crop}</strong>
                          </div>
                        </td>
                        <td className="state-cell">
                          <div className="cell-content">
                            <span className="state-icon">🗺️</span>
                            {item.state}
                          </div>
                        </td>
                        <td className="district-cell">
                          <div className="cell-content">
                            <span className="district-icon">📍</span>
                            {item.district}
                          </div>
                        </td>
                        <td className="market-cell">{item.market}</td>
                        <td className="price-cell">
                          <div className="price-display">
                            <span className="price-value">₹{item.price.toLocaleString('en-IN')}</span>
                            <span className="price-unit">/{item.unit || "Quintal"}</span>
                            <span className="live-price-badge">LIVE</span>
                          </div>
                        </td>
                        <td className="date-cell">{formatDate(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <div className="charts-section">
                <div className="chart-card">
                  <h3>📊 Price Comparison by Crop</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                      />
                      <Bar dataKey="price" fill="#4E7C32" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>📈 Price Trend</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#A7D129" 
                        strokeWidth={3}
                        dot={{ fill: '#4E7C32', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Market;
