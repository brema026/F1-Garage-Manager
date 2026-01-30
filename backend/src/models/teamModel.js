const { getPool } = require('../config/database');
const sql = require('mssql');

// Model for team-related database operations
const teamModel = {
 // Get all teams, with access control based on user role
// IMPORTANTE:
// - El SP dbo.sp_listar_equipos ahora debe traer:
//   presupuesto_total, gasto_total, saldo_disponible
//   conductores_datos (JSON)
//   patrocinadores_datos (JSON)
async getAllTeams(id_usuario, rol) {
  const pool = await getPool();

  const result = await pool.request()
    .input('id_usuario', sql.Int, Number(id_usuario))
    .input('rol', sql.NVarChar(50), String(rol))
    .execute('dbo.sp_listar_equipos');

  const equiposProcesados = (result.recordset || []).map((team) => {
    let conductores = [];
    let patrocinadores = [];

    // Parse conductores
    try {
      conductores = team.conductores_datos ? JSON.parse(team.conductores_datos) : [];
    } catch (_) {
      conductores = [];
    }

    // Parse patrocinadores únicos
    try {
      patrocinadores = team.patrocinadores_datos ? JSON.parse(team.patrocinadores_datos) : [];
    } catch (_) {
      patrocinadores = [];
    }

    return {
      ...team,

      // Normalización base
      id_equipo: Number(team.id_equipo),
      total_conductores: Number(team.total_conductores ?? 0),

      // Relaciones JSON
      conductores,
      patrocinadores,

      // Finanzas
      presupuesto_total: Number(team.presupuesto_total ?? 0),
      gasto_total: Number(team.gasto_total ?? 0),
      saldo_disponible: Number(team.saldo_disponible ?? 0),

      // Compatibilidad con código viejo
      saldo: Number(team.saldo ?? team.saldo_disponible ?? 0)
    };
  });

  return { recordset: equiposProcesados };
},


  // Create a new team
  async createTeam(nombre) {
    const pool = await getPool();
    return pool.request()
      .input('nombre', sql.NVarChar(120), String(nombre))
      .query('INSERT INTO dbo.equipo (nombre) OUTPUT INSERTED.* VALUES (@nombre)');
  },

  // Edit an existing team's name
  async updateTeam(id_equipo, nombre) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('nombre', sql.NVarChar(120), String(nombre))
      .query('UPDATE dbo.equipo SET nombre = @nombre OUTPUT INSERTED.* WHERE id_equipo = @id_equipo');
  },

  // Get finance/balance for a team (endpoint /api/teams/:id/finance)
  async getTeamFinance(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_finanzas_equipo');
  }
};

module.exports = teamModel;
