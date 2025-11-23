const express = require('express');
const router = express.Router();

// Simple placeholder middleware for rate limiting; replace with Redis-backed limiter
router.use((req, res, next) => {
  // Allow all for now
  next();
});

module.exports = router;
