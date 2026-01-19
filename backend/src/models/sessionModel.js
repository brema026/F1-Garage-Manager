const { getPool } = require('../config/database'); // Import database connection pool
const sql = require('mssql'); // Import mssql for SQL Server interactions

// Session model with session functions
const sessionModel = {
    // Save a new session in the database
    async saveSession(id_sesion, id_usuario, duracion_minutos) {
        const pool = getPool(); // Get database connection pool
        return pool.request() // Create a new request

        // Input parameters for the stored procedure
        .input('id_sesion', sql.NVarChar, id_sesion)
        .input('id_usuario', sql.Int, id_usuario)
        .input('duracion_minutos', sql.Int, duracion_minutos)
        
        .execute('dbo.sp_gestionar_sesion'); // Stored procedure to save session
    }
};

// Export the session model for use in other parts of the application
module.exports = sessionModel;