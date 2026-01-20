const sql = require('mssql');
const { getPool } = require('../config/database');

const categoriesModel = {
  // Obtener todas las categorías
  async getCategories() {
    const pool = await getPool();
    return pool.request()
      .query(`
        SELECT 
          category_id,
          nombre
        FROM dbo.part_category
        ORDER BY category_id
      `);
  },

  // Obtener todas las piezas de una categoría
  async getPartsByCategory(category_id) {
    const pool = await getPool();
    return pool.request()
      .input('category_id', sql.Int, category_id)
      .query(`
        SELECT 
          p.id_pieza,
          p.nombre,
          p.precio,
          p.p AS potencia,
          p.a AS aerodinamica,
          p.m AS manejabilidad,
          p.categoria_id,
          ps.stock_disponible AS stock_global
        FROM dbo.pieza p
        LEFT JOIN dbo.part_stock ps ON p.id_pieza = ps.part_id
        WHERE p.categoria_id = @category_id
        ORDER BY p.nombre
      `);
  },

  // Obtener todas las piezas
  async getAllParts() {
    const pool = await getPool();
    return pool.request()
      .query(`
        SELECT 
          p.id_pieza,
          p.nombre,
          p.precio,
          p.p AS potencia,
          p.a AS aerodinamica,
          p.m AS manejabilidad,
          p.categoria_id,
          pc.nombre AS categoria_nombre,
          ps.stock_disponible AS stock_global
        FROM dbo.pieza p
        INNER JOIN dbo.part_category pc ON p.categoria_id = pc.category_id
        LEFT JOIN dbo.part_stock ps ON p.id_pieza = ps.part_id
        ORDER BY p.categoria_id, p.nombre
      `);
  },

  // Obtener inventario del equipo
  async getTeamInventory(id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_equipo', sql.Int, id_equipo)
      .query(`
        SELECT 
          ie.id_equipo,
          e.nombre AS equipo_nombre,
          ie.id_pieza,
          p.nombre AS pieza_nombre,
          pc.nombre AS categoria_nombre,
          ie.cantidad,
          p.precio,
          p.p AS potencia,
          p.a AS aerodinamica,
          p.m AS manejabilidad
        FROM dbo.inventario_equipo ie
        INNER JOIN dbo.equipo e ON ie.id_equipo = e.id_equipo
        INNER JOIN dbo.pieza p ON ie.id_pieza = p.id_pieza
        INNER JOIN dbo.part_category pc ON p.categoria_id = pc.category_id
        WHERE ie.id_equipo = @id_equipo
        ORDER BY pc.nombre, p.nombre
      `);
  }
};

module.exports = categoriesModel;
