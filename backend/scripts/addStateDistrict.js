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

// Example: Add states and districts through API simulation
const addStateAndDistrict = async () => {
  try {
    await connectDB();

    // Example 1: Add a new state by creating a market price entry
    console.log('\n📝 Example: Adding state and district through market price entry...\n');

    const newMarketPrice = {
      crop: "Wheat",
      state: "Tamil Nadu",  // New state
      district: "Coimbatore",  // New district
      market: "Coimbatore Mandi",
      price: 2500,
      unit: "Quintal",
      date: new Date(),
    };

    const result = await MarketPrice.create(newMarketPrice);
    console.log('✅ Market price created with new state and district:');
    console.log(`   State: ${result.state}`);
    console.log(`   District: ${result.district}`);
    console.log(`   Crop: ${result.crop}`);
    console.log(`   Price: ₹${result.price}/${result.unit}`);

    // Example 2: Get all states
    console.log('\n📋 All available states:');
    const states = await MarketPrice.distinct('state');
    states.sort().forEach((state, index) => {
      console.log(`   ${index + 1}. ${state}`);
    });

    // Example 3: Get districts for a specific state
    console.log('\n📍 Districts in Punjab:');
    const punjabDistricts = await MarketPrice.distinct('district', { state: 'Punjab' });
    punjabDistricts.sort().forEach((district, index) => {
      console.log(`   ${index + 1}. ${district}`);
    });

    // Example 4: Get states with their districts
    console.log('\n🗺️  States with their districts:');
    const statesWithDistricts = {};
    for (const state of states) {
      const districts = await MarketPrice.distinct('district', { state });
      statesWithDistricts[state] = districts.sort();
      console.log(`\n   ${state}:`);
      districts.sort().forEach((district, index) => {
        console.log(`      ${index + 1}. ${district}`);
      });
    }

    console.log('\n✅ Examples completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addStateAndDistrict();

