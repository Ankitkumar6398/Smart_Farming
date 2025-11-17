import React, { useEffect, useState } from "react";
import "../styles/Market.css";

/* ===========================
   RECHARTS IMPORTS
=========================== */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ===========================
   CHART.JS IMPORTS
=========================== */
import { Bar as ChartJSBar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const Market = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "localhost/5000/api/market"

  
  const dummyData = [
    { crop: "Wheat", region: "Punjab", market: "Ludhiana", price: 2420 },
    { crop: "Rice", region: "Haryana", market: "Karnal", price: 3200 },
    { crop: "Sugarcane", region: "Uttar Pradesh", market: "Meerut", price: 340 },
    { crop: "Maize", region: "Madhya Pradesh", market: "Indore", price: 1920 },
    { crop: "Cotton", region: "Gujarat", market: "Rajkot", price: 6400 },
    { crop: "Bajra", region: "Rajasthan", market: "Jaipur", price: 1850 }
  ];

  useEffect(() => {
    fetchMarketPrices();
  }, []);

  const fetchMarketPrices = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        setPrices(data);
      } else {
        setPrices(dummyData);
      }
    } catch (error) {
      setPrices(dummyData);
    }
    setLoading(false);
  };



  const chartJSData = {
    labels: prices.map((item) => item.crop),
    datasets: [
      {
        label: "Price (₹)",
        data: prices.map((item) => item.price),
        backgroundColor: "rgba(46, 125, 50, 0.7)",
        borderColor: "rgba(46, 125, 50, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartJSOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div className="market-container">
      <h1>🌾 Market Price Dashboard</h1>
      <p>View today’s mandi prices across major agricultural regions.</p>

      {loading && <p>Loading...</p>}


      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Region</th>
              <th>Market</th>
              <th>Today's Price (₹)</th>
            </tr>
          </thead>

          <tbody>
            {prices.map((item, index) => (
              <tr key={index}>
                <td>{item.crop}</td>
                <td>{item.region}</td>
                <td>{item.market}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}



      <div className="chart">
        <h3>📊 Price Comparison (Recharts)</h3>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={prices} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="price" fill="#2e7d32" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    

      <div className="chart">
        <h3>📉 Price Comparison (Chart.js)</h3>

        <ChartJSBar data={chartJSData} options={chartJSOptions} height={120} />
      </div>
    </div>
  );
};

export default Market;
