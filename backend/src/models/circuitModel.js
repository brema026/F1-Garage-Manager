const { getPool } = require('../config/database');
const sql = require('mssql');

const circuitModel = {
    // Obtener todos los circuitos
    async getAllCircuits(id_usuario, rol) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .input('rol', sql.NVarChar(20), rol)
            .execute('dbo.sp_listar_circuitos');
        return result;
    },

    // Obtener circuito por ID
    async getCircuitById(id_circuito) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_circuito', sql.Int, id_circuito)
            .execute('dbo.sp_obtener_circuito');
        return result;
    },

    // Crear nuevo circuito
    async createCircuit(nombre, distancia_d, curvas_c, id_usuario) {
        const pool = await getPool();
        const result = await pool.request()
            .input('nombre', sql.NVarChar(120), nombre)
            .input('distancia_d', sql.Decimal(10, 3), distancia_d)
            .input('curvas_c', sql.Int, curvas_c)
            .input('id_usuario', sql.Int, id_usuario)
            .execute('dbo.sp_crear_circuito');
        return result;
    },

    // Eliminar circuito
    async deleteCircuit(id_circuito) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id_circuito', sql.Int, id_circuito)
            .execute('dbo.sp_eliminar_circuito');
        return result;
    }
};

module.exports = circuitModel;