const express = require('express'); // Import Express framework
const router = express.Router(); // Create Express router instance
const authController = require('../controllers/authController'); // Import auth controller

/**
 * POST /api/auth/register
 * User registration endpoint
 * Registers a new user with provided details
 * 
 * @route POST /api/auth/register
 * @param {string} nombre - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} rol - User's role
 * @param {number} id_equipo - User's team ID
 * @returns {Object} Success success or error message of registration
 */
router.post('/register', authController.register);

// Export router for use in main app.js
module.exports = router;