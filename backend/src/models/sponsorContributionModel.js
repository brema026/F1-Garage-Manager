const sql = require('mssql');
const { getPool } = require('../config/database');

const sponsorContributionModel = {
  // ---------- Sponsors ----------
  async listSponsors() {
    const pool = await getPool();
    return pool.request().execute('dbo.sp_listar_patrocinadores');
  },

  async createSponsor(data) {
    const pool = await getPool();
    return pool.request()
      .input('nombre', sql.NVarChar(120), data.nombre)
      .input('email', sql.NVarChar(200), data.email ?? null)
      .execute('dbo.sp_registrar_patrocinador');
  },

  // ---------- Contributions ----------
  async createContribution(data) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, data.id_equipo)
      .input('id_patrocinador', sql.Int, data.id_patrocinador)
      // si tu SP NO tiene @fecha, quitá esta línea
      .input('monto', sql.Decimal(12, 2), data.monto)
      .input('descripcion', sql.NVarChar(300), data.descripcion ?? null)
      .execute('dbo.sp_registrar_aporte');
  },

  async listContributionsByTeam(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_listar_aportes_equipo');
  },

  async getBudgetByTeam(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_presupuesto_equipo');
  },

  // opcional
  async getBalanceByTeam(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_saldo_equipo');
  },

  async getTeams() {
    const pool = await getPool();
    return pool.request().execute('sp_listar_equipos'); // o el nombre que uses
  },
};

module.exports = sponsorContributionModel;
