const { getPool } = require('../config/database');
const sql = require('mssql');

const simulationModel = {
  /**
   * Ejecuta la simulación en BD vía Stored Procedure:
   * dbo.sp_ejecutar_simulacion(@id_circuito, @id_usuario)
   */
  async runSimulation(id_circuito, id_usuario) {
    const pool = await getPool();

    const result = await pool.request()
      .input('id_circuito', sql.Int, id_circuito)
      .input('id_usuario', sql.Int, id_usuario)
      .execute('dbo.sp_ejecutar_simulacion');

    return result;
  }
};

module.exports = simulationModel;
