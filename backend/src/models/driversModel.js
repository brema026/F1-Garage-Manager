const sql = require('mssql');
const { getPool } = require('../config/database');

const driversModel = {
  async getDriversByTeam(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_conductores_por_equipo');
  }
};

module.exports = driversModel;