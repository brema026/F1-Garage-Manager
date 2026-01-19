const authService = require('../services/authService'); // Import the auth service
const logger = require('../config/logger'); // Import logger for logging errors
const { getPool } = require('../config/database'); // Import database connection pool
const sql = require('mssql'); // Import mssql package for SQL Server interaction

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
    },

    // Handle user login
    async login(req, res, next) {
        try {
            const { email, password } = req.body; // Extract email and password from request body
            const { sessionId, user } = await authService.loginUser(email, password); // Call auth service to login user
            logger.info(`User logged in: ${email}`); // Log successful login

            // Cookie configuration for session management
            res.cookie('sessionId', sessionId, {
                httpOnly: true, // Mitigate XSS attacks
                secure: process.env.NODE_ENV === 'production', // Only HTTPs in production
                sameSite: 'Lax', // Mitigate CSRF attacks
                maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000 // Default to 1 hour if not set
            });

            // Send success response with user info
            res.status(200).json({ message: 'Login successful', user }); // Send success response with user info
        }

        catch (e) {
            logger.error(`Login error: ${e.message}`);
            res.status(401).json({ error: 'Invalid email or password' });
        }
    },

    // Handle user logout
    async logout(req, res, next) {
        try {
            const sessionId = req.cookies.sessionId; // Get session ID from cookies

            // If session ID exists, delete the session from the database
            if (sessionId) {
                const pool = await getPool(); // Get database connection pool
                await pool.request()
                .input('id_sesion', sql.NVarChar, sessionId)
                .execute('dbo.sp_cerrar_sesion'); // Execute stored procedure to close session

                logger.info(`User logged out, session closed: ${sessionId}`); // Log successful logout
            }

            // Clear the session cookie
            res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
            });
            
            // Clear session cookie
            res.status(200).json({ message: 'Logout successful' }); // Send success response
        }

        catch (e) {
            logger.error(`Logout error: ${e.message}`);
            res.status(500).json({ error: 'Error logging out user' });
        }
    },

    // Check authentication status
    async checkAuth(req, res, next) {
        res.status(200).json({ authenticated: true, user: req.user });
    }
};

// Export the auth controller for use in routes
module.exports = authController;