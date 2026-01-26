// backend/models/CarSetupModel.js
const sql = require('mssql');
const { getPool } = require('../config/database');

const carSetupModel = {
  async getOrCreateCurrentSetup(id_carro) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, Number(id_carro))
      .execute('dbo.sp_get_or_create_setup_actual');
  },

  async getCarSetupSummary(id_carro) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, Number(id_carro))
      .execute('dbo.sp_ver_setup_carro');
    // Ojo: este SP devuelve (normalmente) 2 recordsets:
    // result.recordsets[0] -> resumen (P/A/M, completo)
    // result.recordsets[1] -> lista por categoría con pieza instalada (o null)
  },

  async getInventoryByCategory(id_equipo, category_id) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('category_id', sql.Int, Number(category_id))
      .execute('dbo.sp_inventario_equipo_por_categoria');
  },

  async installOrReplacePart(id_carro, id_equipo, part_id) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, Number(id_carro))
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('part_id', sql.Int, Number(part_id))
      .execute('dbo.sp_instalar_o_reemplazar_pieza');
  },

  async finalizeCar(id_carro, id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, Number(id_carro))
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_finalizar_carro');
  }
};

module.exports = carSetupModel;
