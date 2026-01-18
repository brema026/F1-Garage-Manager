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
    },

    // Get users by their role
    async getUsersByRole(rol) {
        const pool = await getPool();
        return pool.request()
            .input('rol', sql.NVarChar, rol)
            .execute('dbo.sp_listar_usuarios_por_rol');
    },

    // Assign a team to a user
    async assignTeam(id_usuario, id_equipo, id_conductor = null) {
        const pool = await getPool();
        return pool.request()
            .input('id_usuario', sql.Int, (id_usuario === 'null' || !id_usuario) ? null : id_usuario)
            .input('id_equipo', sql.Int, id_equipo)
            .input('id_conductor', sql.Int, id_conductor)
            .execute('dbo.sp_asignar_equipo_usuario');
    },

    // Update driver's skill level
    async updateDriverSkill(id_conductor, habilidad) {
        const pool = await getPool();
        return pool.request()
            .input('id_conductor', sql.Int, id_conductor)
            .input('habilidad', sql.Int, habilidad)
            .query(`
                UPDATE dbo.conductor 
                SET habilidad_h = @habilidad 
                WHERE id_conductor = @id_conductor
            `);
    },

    // Create driver profile
    async createDriverProfile(driverData) {
        const pool = await getPool();
        return pool.request()
            .input('nombre', sql.NVarChar, driverData.nombre)
            .input('id_equipo', sql.Int, driverData.id_equipo || 0)
            .input('habilidad', sql.Int, driverData.habilidad || 50)
            .query(`
                INSERT INTO dbo.conductor (nombre, id_equipo, habilidad_h, id_usuario)
                VALUES (@nombre, @id_equipo, @habilidad, NULL)
            `);
    },

    // Get all drivers with their technical details
    async getAllDriversTechnical() {
        const pool = await getPool();
        return pool.request().query(`
            SELECT c.id_conductor, c.nombre, c.habilidad_h, e.nombre as nombre_equipo, c.id_usuario
            FROM dbo.conductor c
            LEFT JOIN dbo.equipo e ON c.id_equipo = e.id_equipo
        `);
    },

    // Get all drivers with full data
    async getAllDrivers() {
        const pool = await getPool();
        return pool.request().query(`
            SELECT 
                c.id_conductor AS id_driver, 
                c.nombre, 
                c.habilidad_h, 
                c.id_usuario,
                c.id_equipo,
                ISNULL(e.nombre, 'Sin Equipo') AS equipo_nombre
            FROM dbo.conductor c
            LEFT JOIN dbo.equipo e ON c.id_equipo = e.id_equipo
        `);
    }
}

// Export the user model for use in other parts of the application
module.exports = userModel;