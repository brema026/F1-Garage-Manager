const authService = require('../services/authService'); // Import the auth service
const logger = require('../config/logger'); // Import logger for logging errors

const authController = {
    // Handle user registration
    async register(req, res, next) {
        try {
            const newUser = await authService.registerUser(req.body); // Call the auth service to register user
            logger.info(`User registered: ${req.body.email}`); // Log successful registration
            res.status(201).json({ message: 'User registered successfully', user: newUser }); // Send success response
        }

        catch (e) {
            logger.error(`Registration error: ${e.message}`);
            res.status(500).json({ error: 'Error registering user' });
        }
    }
};

// Export the auth controller for use in routes
module.exports = authController;