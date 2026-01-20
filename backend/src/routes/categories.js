const express = require('express');
const router = express.Router();
const categoriesModel = require('../models/categoriesModel');
const logger = require('../config/logger');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/categories
 * Obtener todas las categorías de piezas (5 categorías requeridas)
 */
router.get('/', protect, async (req, res) => {
  try {
    const result = await categoriesModel.getCategories();
    res.status(200).json(result.recordset);
  } catch (e) {
    logger.error(`Error obteniendo categorías: ${e.message}`);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

/**
 * GET /api/categories/parts/all
 * Obtener TODAS las piezas disponibles con información de categoría
 */
router.get('/parts/all', protect, async (req, res) => {
  try {
    const result = await categoriesModel.getAllParts();
    res.status(200).json(result.recordset);
  } catch (e) {
    logger.error(`Error obteniendo todas las piezas: ${e.message}`);
    res.status(500).json({ error: 'Error obteniendo piezas' });
  }
});

/**
 * GET /api/categories/:category_id/parts
 * Obtener todas las piezas de una categoría específica
 */
router.get('/:category_id/parts', protect, async (req, res) => {
  try {
    const { category_id } = req.params;
    const result = await categoriesModel.getPartsByCategory(parseInt(category_id));
    res.status(200).json(result.recordset);
  } catch (e) {
    logger.error(`Error obteniendo piezas por categoría: ${e.message}`);
    res.status(500).json({ error: 'Error obteniendo piezas' });
  }
});

/**
 * GET /api/categories/team/:id_equipo/inventory
 * Obtener inventario completo del equipo
 */
router.get('/team/:id_equipo/inventory', protect, async (req, res) => {
  try {
    const { id_equipo } = req.params;
    
    // Validar que el usuario tenga permiso (su equipo o sea Admin)
    if (req.user.id_equipo && req.user.id_equipo !== parseInt(id_equipo) && req.user.rol !== 'Admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver este inventario' });
    }

    const result = await categoriesModel.getTeamInventory(parseInt(id_equipo));
    res.status(200).json(result.recordset);
  } catch (e) {
    logger.error(`Error obteniendo inventario del equipo: ${e.message}`);
    res.status(500).json({ error: 'Error obteniendo inventario' });
  }
});

module.exports = router;
