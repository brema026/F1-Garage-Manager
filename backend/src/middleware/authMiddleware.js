const { getPool } = require('../config/database'); // Import database connection pool
const sql = require('mssql'); // Import mssql package for SQL Server interaction
const logger = require('../config/logger'); // Import Winston logger
const { log } = require('winston');

// Middleware to protect routes and ensure user is authenticated
const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId; // Get session ID from cookies

        // If no session ID is found, respond with unauthorized error
        if (!sessionId) {
            logger.warn('No session ID provided in cookies'); // Log missing session ID
            return res.status(401).json({ error: 'No session ID provided, session not found' });
        }

        const pool = await getPool(); // Get database connection pool
        
        // Query to validate session and retrieve user details
        const result = await pool.request()
        .input('sessionId', sql.VarChar, sessionId)
        .query(`
            SELECT s.id_usuario, u.nombre, u.rol, u.id_equipo 
            FROM dbo.sesion s
            JOIN dbo.usuario u ON s.id_usuario = u.id_usuario
            WHERE s.id_sesion = @sessionId AND s.expira > SYSUTCDATETIME()
        `);
        
        // If no valid session is found, respond with unauthorized error
        if (result.recordset.length === 0) {
            logger.warn(`Invalid or expired session: ${sessionId}`); // Log invalid session
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        req.user = result.recordset[0]; // Attach user details to request object
        next(); // Proceed to the next middleware or route handler
    }

    catch (e) {
        logger.error(`Auth Middleware Error: ${e.message}`); // Log error message
        res.status(500).json({ error: 'Server error in authentication middleware' }); // Respond with server error
    }
};

// Export the protect middleware for use in other files
module.exports = { protect };