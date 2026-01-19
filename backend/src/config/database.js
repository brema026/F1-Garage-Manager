const sql = require('mssql'); // Import library for SQL Server connection
const logger = require('./logger'); // Import professional logger
require('dotenv').config(); // Load environment variables from .env file

// Configuration for SQL Server connection
const config = {
    server: process.env.DB_SERVER || 'localhost', // Server address
    database: process.env.DB_NAME || 'f1_garage_tec', // Database name
    
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER || 'f1_app_user', // Username
            password: process.env.DB_PASSWORD || 'F1Garage!2025' // Password
        }
    },
    
    options: {
        encrypt: false, // Disable encryption for local development
        trustServerCertificate: true, // Trust server certificate
        port: parseInt(process.env.DB_PORT) || 1433 // Port number
    }
};

let pool; // Variable to hold the connection pool

/**
 * Establishes a connection to the SQL Server database using a connection pool.
 * Logs an error and retries automatically after 5 seconds if the connection fails.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<sql.ConnectionPool|undefined>} The SQL Server connection pool if successful; otherwise undefined.
 */
async function connectDB() {
    try {
        pool = new sql.ConnectionPool(config); // Establish connection
        await pool.connect(); // Ensure the pool is connected
        logger.info('Connected to SQL Server');
        return pool; // Return the connection pool
    }

    catch (e) {
        logger.error(`Database connection failed: ${e.message}`);
        setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    }
}

/**
 * Retrieves the current SQL Server connection pool.
 * 
 * @function getPool
 * @returns {sql.ConnectionPool} The current SQL Server connection pool.
 */
function getPool() {
    return pool;
}

/**
 * Closes the SQL Server connection pool.
 * 
 * @async
 * @function closeDB
 */
async function closeDB() {
    if (pool) {
        await pool.close();
        logger.info('Database connection closed');
    }
}

// Export the functions for external use
module.exports = { connectDB, getPool, closeDB };