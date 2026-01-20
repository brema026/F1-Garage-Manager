const sql = require('mssql');
const { getPool } = require('../config/database');

const carSetupModel = {
    // Obtener carros de un equipo con sus configuraciones
    async getCarsByTeam(teamId) {
        const pool = getPool();
        return await pool.request()
            .input('id_equipo', sql.Int, teamId)
            .execute('dbo.sp_carros_equipo');
    },

    // Obtener inventario del equipo
    async getTeamInventory(teamId) {
        const pool = getPool();
        return await pool.request()
            .input('id_equipo', sql.Int, teamId)
            .execute('dbo.sp_inventario_equipo');
    },

    // Obtener conductores del equipo
    async getTeamDrivers(teamId) {
        const pool = getPool();
        return await pool.request()
            .input('id_equipo', sql.Int, teamId)
            .execute('dbo.sp_conductores_equipo');
    },

    // Obtener categorías disponibles
    async getCategories() {
        const pool = getPool();
        return await pool.request()
            .execute('dbo.sp_listar_categorias');
    },

    // Crear un nuevo carro
    async createCar(id_equipo, nombre) {
        const pool = getPool();
        return await pool.request()
            .input('id_equipo', sql.Int, id_equipo)
            .input('nombre', sql.NVarChar(120), nombre)
            .execute('dbo.sp_crear_carro');
    },

    // Obtener carro por ID
    async getCarById(carId) {
        const pool = getPool();
        return await pool.request()
            .input('id_carro', sql.Int, carId)
            .query(`
                SELECT c.*, e.nombre as nombre_equipo
                FROM dbo.carro c
                INNER JOIN dbo.equipo e ON c.id_equipo = e.id_equipo
                WHERE c.id_carro = @id_carro
            `);
    },

    // Instalar o reemplazar parte en carro
    async installPart(carId, piezaId, categoryId) {
        const pool = getPool();
        return await pool.request()
            .input('id_carro', sql.Int, carId)
            .input('id_pieza', sql.Int, piezaId)
            .input('categoria_id', sql.Int, categoryId)
            .execute('dbo.sp_instalar_pieza');
    },

    // Asignar conductor a carro
    async assignDriver(carId, conductorId) {
        const pool = getPool();
        return await pool.request()
            .input('id_carro', sql.Int, carId)
            .input('id_conductor', sql.Int, conductorId)
            .execute('dbo.sp_asignar_conductor');
    },

    // Finalizar carro
    async finalizeCar(carId) {
        const pool = getPool();
        return await pool.request()
            .input('id_carro', sql.Int, carId)
            .execute('dbo.sp_finalizar_carro');
    },

    // Desinstalar parte (eliminar de setup)
    async uninstallPart(carId, categoryId) {
        const pool = getPool();
        
        // Primero obtener el setup actual
        const setupResult = await pool.request()
            .input('car_id', sql.Int, carId)
            .query(`
                SELECT setup_id, es_actual 
                FROM dbo.car_setup 
                WHERE car_id = @car_id AND es_actual = 1
            `);
        
        if (setupResult.recordset.length === 0) {
            throw new Error('No se encontró un setup activo para este carro');
        }
        
        const setupId = setupResult.recordset[0].setup_id;
        
        // Obtener la pieza que se va a remover
        const pieceResult = await pool.request()
            .input('setup_id', sql.Int, setupId)
            .input('category_id', sql.Int, categoryId)
            .query(`
                SELECT csp.part_id, c.id_equipo
                FROM dbo.car_setup_pieza csp
                INNER JOIN dbo.car_setup cs ON csp.setup_id = cs.setup_id
                INNER JOIN dbo.carro c ON cs.car_id = c.id_carro
                WHERE csp.setup_id = @setup_id AND csp.category_id = @category_id
            `);
        
        if (pieceResult.recordset.length === 0) {
            throw new Error('No hay ninguna pieza instalada en esta categoría');
        }
        
        const partId = pieceResult.recordset[0].part_id;
        const teamId = pieceResult.recordset[0].id_equipo;
        
        // Devolver al inventario
        await pool.request()
            .input('id_equipo', sql.Int, teamId)
            .input('id_pieza', sql.Int, partId)
            .query(`
                UPDATE dbo.inventario_equipo
                SET cantidad = cantidad + 1, last_update = SYSUTCDATETIME()
                WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza
            `);
        
        // Eliminar del setup
        await pool.request()
            .input('setup_id', sql.Int, setupId)
            .input('category_id', sql.Int, categoryId)
            .query(`
                DELETE FROM dbo.car_setup_pieza
                WHERE setup_id = @setup_id AND category_id = @category_id
            `);
        
        return { recordset: [{ mensaje: 'Pieza desinstalada correctamente' }] };
    }
};

module.exports = carSetupModel;