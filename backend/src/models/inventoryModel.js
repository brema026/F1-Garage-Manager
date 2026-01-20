const sql = require('mssql');
const { getPool } = require('../config/database');

const inventoryModel = {
  async getInventoryByTeam(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_inventario_equipo_detalle');
  },

  async reduceInventoryItem(id_equipo, id_pieza, cantidad) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('id_pieza', sql.Int, Number(id_pieza))
      .input('cantidad', sql.Int, Number(cantidad))
      .execute('dbo.sp_inventario_equipo_reducir');
  },

  async deleteInventoryItem(id_equipo, id_pieza) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('id_pieza', sql.Int, Number(id_pieza))
      .execute('dbo.sp_inventario_equipo_eliminar_item');
  }
};

module.exports = inventoryModel;
