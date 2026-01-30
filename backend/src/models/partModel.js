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
  },

  async buyPart(id_equipo, id_pieza, cantidad) {
  const pool = await getPool(); // OJO: según tu proyecto, usás getPool, no getConnection
  return pool.request()
    .input('id_equipo', sql.Int, id_equipo)
    .input('id_pieza', sql.Int, id_pieza)
    .input('cantidad', sql.Int, cantidad)
    .execute('sp_comprar_pieza_equipo');
},

async reduceStock(id_pieza, cantidad) {
  const pool = await getPool();
  return pool.request()
    .input('id_pieza', sql.Int, id_pieza)
    .input('cantidad', sql.Int, cantidad)
    .execute('sp_reducir_stock_pieza');
},

async deletePart(id_pieza) {
  const pool = await getPool();
  return pool.request()
    .input('id_pieza', sql.Int, id_pieza)
    .execute('sp_eliminar_pieza_completa');
},

async getTeamBalance(id_equipo) {
  const pool = await getPool();
  return pool.request()
    .input('id_equipo', sql.Int, id_equipo)
    .execute('sp_finanzas_equipo'); // o el SP que definan para esto
}


};

module.exports = partModel;

