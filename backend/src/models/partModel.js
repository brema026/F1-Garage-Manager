const sql = require('mssql');
const { getPool } = require('../config/database');

const partModel = {
  async registerPart(data) {
    const pool = await getPool();

    return pool.request()
      .input('nombre', sql.NVarChar(120), data.nombre)
      .input('precio', sql.Decimal(12, 2), data.precio)
      .input('p', sql.TinyInt, data.p)
      .input('a', sql.TinyInt, data.a)
      .input('m', sql.TinyInt, data.m)
      .input('categoria_id', sql.Int, data.categoria_id)
      .input('stock_inicial', sql.Int, data.stock_inicial)
      .execute('sp_registrar_pieza');
  },

  async addStock(id_pieza, cantidad) {
    const pool = await getPool();

    return pool.request()
      .input('id_pieza', sql.Int, id_pieza)
      .input('cantidad', sql.Int, cantidad)
      .execute('sp_agregar_stock_pieza');
  },

  async getAllParts() {
    const pool = await getPool();

    return pool.request()
      .execute('sp_listar_piezas');
  }
};

module.exports = partModel;

