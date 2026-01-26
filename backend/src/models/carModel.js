const sql = require('mssql');
const { getPool } = require('../config/database');

const carModel = {
  async createCar(id_equipo, nombre) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .input('nombre', sql.NVarChar(120), nombre)
      .execute('dbo.sp_crear_carro');
  },

  async getCarsByTeam(id_equipo) {
    // Si ya tenés SP para esto, cámbialo aquí.
    // Te dejo uno sugerido: dbo.sp_carros_por_equipo
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_carros_por_equipo');
  },

  async getMyCars(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, Number(id_equipo))
      .execute('dbo.sp_carros_por_equipo');
  }
};

module.exports = carModel;
