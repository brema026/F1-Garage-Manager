const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');


/**
 * GET /api/teams
 * Get list of teams endpoint
 * 
 * @route GET /api/teams
 * @returns {Array} List of teams
 */
router.get('/', protect, teamController.getTeams);

/**
 * POST /api/teams
 * Create a new team endpoint (Admin only)
 * 
 * @route POST /api/teams
 * @body {string} nombre - Name of the team
 * @returns {Object} Created team
 */
router.post('/', protect, teamController.createTeam);

/**
 * PUT /api/teams/:id
 * Update an existing team's name endpoint (Admin only)
 * 
 * @route PUT /api/teams/:id
 * @param {number} id - ID of the team to update
 * @body {string} nombre - New name of the team
 * @returns {Object} Updated team
 */
router.put('/:id', protect, teamController.updateTeam);

/**
 * GET /api/teams/:id/finance
 * Get finance info for a team (Admin or same-team Engineer)
 */
router.get('/:id/finance', protect, teamController.getTeamFinance);


// Export router for use in main app.js
module.exports = router;