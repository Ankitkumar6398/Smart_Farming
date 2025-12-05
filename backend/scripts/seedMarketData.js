const mongoose = require('mongoose');
require('dotenv').config();
const MarketPrice = require('../models/MarketPrice');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const marketData = [
  // Punjab
  { crop: "Wheat", state: "Punjab", district: "Ludhiana", market: "Ludhiana Mandi", price: 2420, unit: "Quintal" },
  { crop: "Rice", state: "Punjab", district: "Amritsar", market: "Amritsar Mandi", price: 2850, unit: "Quintal" },
  { crop: "Cotton", state: "Punjab", district: "Bathinda", market: "Bathinda Mandi", price: 7200, unit: "Quintal" },
  { crop: "Sugarcane", state: "Punjab", district: "Jalandhar", market: "Jalandhar Mandi", price: 350, unit: "Quintal" },
  
  // Haryana
  { crop: "Wheat", state: "Haryana", district: "Karnal", market: "Karnal Mandi", price: 2380, unit: "Quintal" },
  { crop: "Rice", state: "Haryana", district: "Karnal", market: "Karnal Mandi", price: 3200, unit: "Quintal" },
  { crop: "Mustard", state: "Haryana", district: "Rohtak", market: "Rohtak Mandi", price: 5200, unit: "Quintal" },
  { crop: "Bajra", state: "Haryana", district: "Hisar", market: "Hisar Mandi", price: 1950, unit: "Quintal" },
  
  // Uttar Pradesh
  { crop: "Sugarcane", state: "Uttar Pradesh", district: "Meerut", market: "Meerut Mandi", price: 340, unit: "Quintal" },
  { crop: "Wheat", state: "Uttar Pradesh", district: "Agra", market: "Agra Mandi", price: 2250, unit: "Quintal" },
  { crop: "Rice", state: "Uttar Pradesh", district: "Lucknow", market: "Lucknow Mandi", price: 3100, unit: "Quintal" },
  { crop: "Potato", state: "Uttar Pradesh", district: "Agra", market: "Agra Mandi", price: 1200, unit: "Quintal" },
  
  // Madhya Pradesh
  { crop: "Wheat", state: "Madhya Pradesh", district: "Indore", market: "Indore Mandi", price: 2300, unit: "Quintal" },
  { crop: "Soybean", state: "Madhya Pradesh", district: "Indore", market: "Indore Mandi", price: 4800, unit: "Quintal" },
  { crop: "Maize", state: "Madhya Pradesh", district: "Indore", market: "Indore Mandi", price: 1920, unit: "Quintal" },
  { crop: "Cotton", state: "Madhya Pradesh", district: "Bhopal", market: "Bhopal Mandi", price: 6800, unit: "Quintal" },
  
  // Gujarat
  { crop: "Cotton", state: "Gujarat", district: "Rajkot", market: "Rajkot Mandi", price: 6400, unit: "Quintal" },
  { crop: "Groundnut", state: "Gujarat", district: "Ahmedabad", market: "Ahmedabad Mandi", price: 5800, unit: "Quintal" },
  { crop: "Wheat", state: "Gujarat", district: "Vadodara", market: "Vadodara Mandi", price: 2400, unit: "Quintal" },
  
  // Rajasthan
  { crop: "Bajra", state: "Rajasthan", district: "Jaipur", market: "Jaipur Mandi", price: 1850, unit: "Quintal" },
  { crop: "Wheat", state: "Rajasthan", district: "Jodhpur", market: "Jodhpur Mandi", price: 2350, unit: "Quintal" },
  { crop: "Mustard", state: "Rajasthan", district: "Kota", market: "Kota Mandi", price: 5100, unit: "Quintal" },
  
  // Maharashtra
  { crop: "Sugarcane", state: "Maharashtra", district: "Pune", market: "Pune Mandi", price: 320, unit: "Quintal" },
  { crop: "Cotton", state: "Maharashtra", district: "Nagpur", market: "Nagpur Mandi", price: 6600, unit: "Quintal" },
  { crop: "Soybean", state: "Maharashtra", district: "Aurangabad", market: "Aurangabad Mandi", price: 4900, unit: "Quintal" },
];

const seedMarketData = async () => {
  try {
    await connectDB();

    // Set date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Clear existing data for today (optional - comment out if you want to keep old data)
    // await MarketPrice.deleteMany({ date: { $gte: today } });

    // Insert market data
    const pricesToInsert = marketData.map(item => ({
      ...item,
      date: today,
      lastUpdated: new Date(),
    }));

    const result = await MarketPrice.insertMany(pricesToInsert);
    console.log(`✅ Successfully seeded ${result.length} market price records`);
    console.log(`📅 Date: ${today.toLocaleDateString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding market data:', error);
    process.exit(1);
  }
};

seedMarketData();

