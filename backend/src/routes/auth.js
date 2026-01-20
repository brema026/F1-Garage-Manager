const express = require('express'); // Import Express framework
const router = express.Router(); // Create Express router instance
const authController = require('../controllers/authController'); // Import auth controller
const { protect } = require('../middleware/authMiddleware'); // Import auth middleware
const { log } = require('winston');
const logger = require('../config/logger');

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

/**
 * POST /api/auth/login
 * User login endpoint
 * Authenticates a user with provided email and password
 * 
 * @route POST /api/auth/login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} Success success or error message of login
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * User logout endpoint
 * Logs out the authenticated user by clearing the session cookie
 * 
 * @route POST /api/auth/logout
 * @returns {Object} Success or error message of logout
 */
router.post('/logout', protect, authController.logout);

// Profile endpoint
router.get('/profile', protect, authController.getProfile);

// Check authentication status endpoint
router.get('/check-auth', protect, authController.checkAuth);

// Export router for use in main app.js
module.exports = router;