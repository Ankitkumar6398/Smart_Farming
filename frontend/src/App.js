import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import CropHealth from "./components/CropHealth";
import Irrigation from "./components/Irrigation";
import Market from "./components/Market";
import Footer from "./components/Footer";
import Schemes from "./components/Schemes";
import Profile from "./components/Profile"
import Community from "./components/Community";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crop-health" element={<CropHealth />} />
        <Route path="/irrigation" element={<Irrigation />} />
        <Route path="/market" element={<Market />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />

        
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
