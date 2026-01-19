const { getPool } = require('../config/database');
const sql = require('mssql');

// Model for team-related database operations
const teamModel = {
    // Get all teams, with access control based on user role
    async getAllTeams(id_usuario, rol) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .input('rol', sql.NVarChar, rol)
            .execute('dbo.sp_listar_equipos');

        const equiposProcesados = result.recordset.map(team => ({
            ...team,
            conductores: team.conductores_datos ? JSON.parse(team.conductores_datos) : []
        }));

        return { recordset: equiposProcesados };
    },

    // Create a new team
    async createTeam(nombre) {
        const pool = await getPool();
        return pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .query('INSERT INTO dbo.equipo (nombre) OUTPUT INSERTED.* VALUES (@nombre)');
    },

    // Edit an existing team's name
    async updateTeam(id_equipo, nombre) {
        const pool = await getPool();
        return pool.request()
            .input('id_equipo', sql.Int, id_equipo)
            .input('nombre', sql.NVarChar, nombre)
            .query('UPDATE dbo.equipo SET nombre = @nombre OUTPUT INSERTED.* WHERE id_equipo = @id_equipo');
    }
};

module.exports = teamModel;