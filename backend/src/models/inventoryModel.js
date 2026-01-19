const sql = require('mssql');
const { getPool } = require('../config/database');

const inventoryModel = {
  async getInventoryByTeam(id_equipo) {
    const pool = await getPool();

    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_inventario_equipo_detalle');
  }
};

module.exports = inventoryModel;
