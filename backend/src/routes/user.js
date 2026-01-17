const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/users/engineers
 * Get list of engineers endpoint
 * 
 * @route GET /api/users/engineers
 * @returns {Array} List of engineers
 */
router.get('/engineers', protect, userController.getEngineers);

/**
 * GET /api/users/drivers
 * Get list of drivers endpoint
 * 
 * @route GET /api/users/drivers
 * @returns {Array} List of drivers
 */
router.get('/drivers', protect, userController.getDrivers);

/**
 * PUT /api/users/:id_usuario/assign-team
 * Assign a team to a user endpoint (Admin only)
 * 
 * @route PUT /api/users/:id_usuario/assign-team
 * @param {number} id_usuario - ID of the user to assign team
 * @body {number} id_equipo - ID of the team to assign
 * @returns {Object} Success message
 */
router.put('/:id_usuario/assign-team', protect, userController.assignTeam);

// Export router for use in main app.js
module.exports = router;