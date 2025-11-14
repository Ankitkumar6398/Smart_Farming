const express = require('express');
const authenticate = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/user/me
// @desc    Get current user profile
// @access  Private (requires authentication)
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;

