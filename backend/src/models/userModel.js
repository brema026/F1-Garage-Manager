const { getPool } = require('../config/database'); // Import database connection pool
const sql = require('mssql'); // Import mssql for SQL Server interactions

// User model with user functions
const userModel = {
    // Register a new user in the database
    async register(userData) {
        const pool = await getPool(); // Get database connection pool
        return pool.request() // Create a new request

        // Input parameters for the stored procedure
        .input('nombre', sql.NVarChar, userData.nombre)
        .input('email', sql.NVarChar, userData.email)
        .input('password_hash', sql.NVarChar, userData.password_hash)
        .input('rol', sql.NVarChar, userData.rol)
        .input('id_equipo', sql.Int, userData.id_equipo)

        .execute('sp_registrar_usuario'); // Stored procedure to register user
    },

    // Get user by email for login validation
    async getByEmail(email) {
        const pool = await getPool(); // Get database connection pool
        return pool.request() // Create a new request

        .input('email', sql.NVarChar, email) // Input parameter for the stored procedure

        .execute('dbo.sp_validar_login'); // Stored procedure to get user by email
    }
}

// Export the user model for use in other parts of the application
module.exports = userModel;