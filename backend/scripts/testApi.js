// Simple script to test whether the market API is responding correctly
require("dotenv").config();
const { getRealTimeData } = require("../services/marketApiService");

const testAPI = async () => {
  console.log("Running Market API Test...\n");

  try {
    // -------------------------------
    // Test 1: Basic fetch (no filters)
    // -------------------------------
    console.log("Test 1: Fetching sample data (no filters)...");
    const allData = await getRealTimeData({ limit: 10 });
    console.log(`Records fetched: ${allData.length}\n`);

    if (allData.length > 0) {
      console.log("Sample Record:");
      console.log(JSON.stringify(allData[0], null, 2));
    }

    // -------------------------------
    // Test 2: Filter by state
    // -------------------------------
    console.log("\nTest 2: Fetching data for state = Punjab...");
    const punjabData = await getRealTimeData({ state: "Punjab", limit: 5 });
    console.log(`Records fetched: ${punjabData.length}\n`);

    if (punjabData.length > 0) {
      console.log("Sample Record:");
      console.log(JSON.stringify(punjabData[0], null, 2));
    }

    // -------------------------------
    // Test 3: Filter by crop
    // -------------------------------
    console.log("\nTest 3: Fetching data for crop = Wheat...");
    const wheatData = await getRealTimeData({ crop: "Wheat", limit: 5 });
    console.log(`Records fetched: ${wheatData.length}\n`);

    if (wheatData.length > 0) {
      console.log("Sample Record:");
      console.log(JSON.stringify(wheatData[0], null, 2));
    }

    console.log("\nAll tests completed successfully.");
  } catch (error) {
    console.error("\nTest Failed:", error.message);
    console.error("Error Details:", error);
  }

  process.exit(0);
};

testAPI();
