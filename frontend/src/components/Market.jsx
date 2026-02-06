/* -------------------------------------------------------------
   MARKET PRICE DASHBOARD — CLEAN PROFESSIONAL VERSION
   Author: Ankit Kumar
-------------------------------------------------------------- */

import React, { useEffect, useState } from "react";
import "../styles/Market.css";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, Cell
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Market = () => {

  /* -------------------------------------------------------------
     STATE MANAGEMENT
  -------------------------------------------------------------- */

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Lists
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);

  // UI Helpers
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  // Chart crop filter
  const [selectedCropFromLegend, setSelectedCropFromLegend] = useState(null);


  /* -------------------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------------------- */

  useEffect(() => {
    fetchStates();
    fetchCrops();
  }, []);


  /* -------------------------------------------------------------
     STATE → DISTRICT → MARKET CHAIN
  -------------------------------------------------------------- */

  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState);
      setSelectedDistrict("");
      setSelectedMarket("");
    } else {
      setDistricts([]);
      setMarkets([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedState) {
      fetchMarkets(selectedState, selectedDistrict);
      if (!selectedDistrict) setSelectedMarket("");
    } else {
      setMarkets([]);
    }
  }, [selectedState, selectedDistrict]);


  /* -------------------------------------------------------------
     FETCH PRICES WHEN FILTERS CHANGE
  -------------------------------------------------------------- */

  useEffect(() => {
    fetchMarketPrices();
  }, [selectedState, selectedDistrict, selectedCrop, selectedMarket, selectedDate]);


  /* -------------------------------------------------------------
     AUTO REFRESH EVERY 30s
  -------------------------------------------------------------- */

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchMarketPrices(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedState, selectedDistrict, selectedCrop, selectedMarket, selectedDate]);


  /* -------------------------------------------------------------
     API FUNCTIONS
  -------------------------------------------------------------- */

  const fetchStates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/market/states`);
      const json = await res.json();
      console.log("States API response:", json);
      if (json.success && json.data) {
        setStates(json.data);
        console.log("States loaded:", json.data.length);
      } else {
        console.warn("States API returned unsuccessful response:", json);
      }
    } catch (err) {
      console.error("Error loading states:", err);
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const res = await fetch(
        `${API_URL}/api/market/districts?state=${encodeURIComponent(state)}`
      );
      const json = await res.json();
      console.log("Districts API response:", json);
      if (json.success && json.data) {
        setDistricts(json.data);
        console.log("Districts loaded:", json.data.length);
      } else {
        console.warn("Districts API returned unsuccessful response:", json);
      }
    } catch (err) {
      console.error("Error loading districts:", err);
    }
  };

  const fetchCrops = async () => {
    try {
      const res = await fetch(`${API_URL}/api/market/crops`);
      const json = await res.json();
      console.log("Crops API response:", json);
      if (json.success && json.data) {
        setCrops(json.data);
        console.log("Crops loaded:", json.data.length);
      } else {
        console.warn("Crops API returned unsuccessful response:", json);
      }
    } catch (err) {
      console.error("Error loading crops:", err);
    }
  };

  const fetchMarkets = async (state, district) => {
    try {
      const params = new URLSearchParams({ state });
      if (district) params.append("district", district);

      const res = await fetch(`${API_URL}/api/market/markets?${params}`);
      const json = await res.json();
      console.log("Markets API response:", json);

      if (json.success && json.data) {
        setMarkets(json.data);
        console.log("Markets loaded:", json.data.length);
      } else {
        console.warn("Markets API returned unsuccessful response:", json);
      }
    } catch (err) {
      console.error("Error loading markets:", err);
    }
  };


  /* -------------------------------------------------------------
     FETCH PRICES (REALTIME FIRST, THEN DB)
  -------------------------------------------------------------- */

  const fetchMarketPrices = async (forceRealtime = false) => {
    try {
      setLoading(false);
      setIsRefreshing(true);

      const params = new URLSearchParams();
      if (selectedState && selectedState.trim()) params.append("state", selectedState.trim());
      if (selectedDistrict && selectedDistrict.trim()) params.append("district", selectedDistrict.trim());
      if (selectedCrop && selectedCrop.trim()) params.append("crop", selectedCrop.trim());
      if (selectedMarket && selectedMarket.trim()) params.append("market", selectedMarket.trim());
      if (selectedDate && selectedDate.trim()) params.append("date", selectedDate.trim());
      
      console.log("🔍 Frontend sending filters:", {
        state: selectedState || "(none)",
        district: selectedDistrict || "(none)",
        crop: selectedCrop || "(none)",
        market: selectedMarket || "(none)",
        date: selectedDate || "(none)",
      });

      let json = { success: false, data: [] };
      let source = "unknown";

      if (forceRealtime) {
        try {
          const res = await fetch(`${API_URL}/api/market/realtime?${params}`);
          json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setPrices(json.data);
            setDataSource("external_api");
            setLastUpdated(new Date());
            setIsRefreshing(false);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Realtime API error:", err);
        }
      }

      params.append("useRealtime", "true");
      try {
        const res = await fetch(`${API_URL}/api/market?${params}`);
        json = await res.json();
        source = json.source || "database";
        if (json.success && json.data && json.data.length > 0) {
          setPrices(json.data);
          setDataSource(source);
          setLastUpdated(new Date());
          setIsRefreshing(false);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Market API error:", err);
      }

      if (!json.success || !json.data || json.data.length === 0) {
        params.delete("useRealtime");
        try {
          const res = await fetch(`${API_URL}/api/market?${params}`);
          json = await res.json();
          source = json.source || "database";
        } catch (err) {
          console.error("Database fallback error:", err);
        }
      }

      setPrices(json.success && json.data ? json.data : []);
      setDataSource(source);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setPrices([]);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };


  /* -------------------------------------------------------------
     RESET + SYNC DATA
  -------------------------------------------------------------- */

  const handleResetFilters = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedCrop("");
    setSelectedMarket("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleSyncRealtime = async () => {
    try {
      setIsSyncing(true);

      const body = {};
      if (selectedState) body.state = selectedState;
      if (selectedDistrict) body.district = selectedDistrict;
      if (selectedCrop) body.crop = selectedCrop;

      const res = await fetch(`${API_URL}/api/market/sync-realtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      setSyncMessage(
        json.success ? `Data Synced: ${json.message}` : `Sync Failed: ${json.message}`
      );

      if (json.success) setTimeout(fetchMarketPrices, 1000);
    } catch {
      setSyncMessage("Error syncing data.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };


  /* -------------------------------------------------------------
     UTILITIES
  -------------------------------------------------------------- */

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });


  /* -------------------------------------------------------------
     CHART COLORS
  -------------------------------------------------------------- */

  const colors = [
    "#4E7C32", "#A7D129", "#FF6B6B", "#4ECDC4", "#45B7D1",
    "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
    "#F8B739", "#52BE80", "#E74C3C", "#9B59B6", "#3498DB"
  ];

  const getColor = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  /* -------------------------------------------------------------
     PREPARE CHART DATA
  -------------------------------------------------------------- */

  const filtered = selectedCropFromLegend
    ? prices.filter((p) => p.crop === selectedCropFromLegend)
    : prices;

  const chartData = filtered.map((p) => ({
    name: p.crop,
    price: p.price,
    color: getColor(p.crop),
  }));

  const uniqueCrops = [...new Set(prices.map((p) => p.crop))].map((crop) => ({
    name: crop,
    color: getColor(crop),
  }));


  /* -------------------------------------------------------------
     UI RENDER
  -------------------------------------------------------------- */

  return (
    <div className="market-container">

      {/* Header */}
      <div className="market-header">
        {/* <h1>Real-Time Market Prices</h1>
        <p>Get live mandi prices filtered by various parameters</p> */}

        {autoRefresh && (
          <div className="realtime-banner">
            <span className="pulse-dot"></span>
            Updating every 30 seconds
          </div>
        )}
      </div>

      {/* ---------------- FILTERS SECTION ---------------- */}
      <div className="filters-section">

        <div className="filters-grid">
          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="filter-group">
            <label>State {states.length === 0 && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>(Loading...)</span>}</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="filter-select"
            >
              <option value="">All States</option>
              {states.length === 0 ? (
                <option value="" disabled>Loading states...</option>
              ) : (
                states.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
              className="filter-select"
            >
              <option value="">All Districts</option>
              {districts.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Crop {crops.length === 0 && <span style={{color: '#ff6b6b', fontSize: '0.8rem'}}>(Loading...)</span>}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="filter-select"
            >
              <option value="">All Crops</option>
              {crops.length === 0 ? (
                <option value="" disabled>Loading crops...</option>
              ) : (
                crops.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="filter-select"
              disabled={!selectedState}
            >
              <option value="">All Markets</option>
              {markets.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button className="btn-reset" onClick={handleResetFilters}>
            Reset Filters
          </button>

          <button
            className="btn-refresh"
            onClick={() => fetchMarketPrices(false)}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="btn-realtime"
            onClick={() => fetchMarketPrices(true)}
            disabled={isRefreshing}
            title="Fetch real-time prices directly from external API"
          >
            {isRefreshing ? "Fetching..." : "🔄 Real-time Prices"}
          </button>

          <button
            className="btn-sync"
            onClick={handleSyncRealtime}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "Sync to Database"}
          </button>

          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh (30s)
          </label>
        </div>

        {syncMessage && (
          <div className="sync-message">{syncMessage}</div>
        )}

        {(selectedState ||
          selectedDistrict ||
          selectedCrop ||
          selectedMarket) && (
          <div className="active-filters">
            {selectedState && <span className="filter-badge">State: {selectedState}</span>}
            {selectedDistrict && <span className="filter-badge">District: {selectedDistrict}</span>}
            {selectedCrop && <span className="filter-badge">Crop: {selectedCrop}</span>}
            {selectedMarket && <span className="filter-badge">Market: {selectedMarket}</span>}
          </div>
        )}

        {lastUpdated && (
          <div className="last-updated">
            Last updated at {formatTime(lastUpdated)} | Showing prices for {formatDate(selectedDate)}
            {dataSource && (
              <span className="data-source-badge">
                {dataSource === "external_api" ? "🔄 Real-time" : "💾 Database"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ---------------- LOADING ---------------- */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading market prices...</p>
        </div>
      )}

      {/* ---------------- RESULTS ---------------- */}
      {!loading &&
        (prices.length === 0 ? (
          <div className="no-data">
            <p>No market prices found for selected filters.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-label">Total Records</div>
                <div className="summary-value">{prices.length}</div>
              </div>

              <div className="summary-card">
                <div className="summary-label">Average Price</div>
                <div className="summary-value">
                  ₹
                  {Math.round(
                    prices.reduce((a, b) => a + b.price, 0) / prices.length
                  )}
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-label">Highest Price</div>
                <div className="summary-value">
                  ₹{Math.max(...prices.map((p) => p.price))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>State</th>
                    <th>District</th>
                    <th>Market</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {prices.map((item, index) => (
                    <tr key={index}>
                      <td>{item.crop}</td>
                      <td>{item.state}</td>
                      <td>{item.district}</td>
                      <td>{item.market}</td>
                      <td>
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td>{formatDate(item.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            <div className="charts-section">
              <div className="chart-card">
                <h3>Price Comparison by Crop</h3>

                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Price Trend</h3>

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Line
                      dataKey="price"
                      stroke="#4E7C32"
                      strokeWidth={3}
                      dot={(props) => (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={6}
                          fill={props.payload.color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      )}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Crop Legend */}
                <div className="crop-color-legend">
                  <h4>
                    Crop Colors{" "}
                    {selectedCropFromLegend &&
                      `(Filtered: ${selectedCropFromLegend})`}
                  </h4>

                  <div className="legend-items">
                    {uniqueCrops.map((item, index) => {
                      const active = item.name === selectedCropFromLegend;
                      return (
                        <div
                          key={index}
                          className={`legend-item ${active ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedCropFromLegend(
                              active ? null : item.name
                            )
                          }
                        >
                          <span
                            className="legend-color-dot"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          {item.name}
                          {active && <span className="checkmark">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
    </div>
  );
};

export default Market;
