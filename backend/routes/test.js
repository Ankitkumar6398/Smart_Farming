const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/test/users
// @desc    Test endpoint to get all users (for debugging)
// @access  Public (remove in production)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// @route   GET /api/test/db
// @desc    Test database connection
// @access  Public
router.get('/db', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    database: {
      status: dbStates[dbStatus] || 'unknown',
      connected: dbStatus === 1,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: Object.keys(mongoose.connection.collections)
    }
  });
});

module.exports = router;

