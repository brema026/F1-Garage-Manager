const express = require('express'); // Import Express framework
const router = express.Router(); // Create Express router instance

/**
 * GET /api/health
 * Health check endpoint - verifies server is running
 * Returns server status and current timestamp
 * 
 * @route GET /api/health
 * @returns {Object} Server status and timestamp
 */
router.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Export router for use in main app.js
module.exports = router;