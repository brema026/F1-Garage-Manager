const express = require('express');
const router = express.Router();

const simulationController = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * POST /api/simulations
 * Ejecutar simulación (Admin only)
 * body: { id_circuito }
 */
router.post('/', protect, simulationController.run);

/**
 * GET /api/simulations
 * Listar simulaciones (según rol)
 * query: limit, offset
 */
router.get('/', protect, simulationController.list);

/**
 * GET /api/simulations/:id
 * Detalle (header + resultados + snapshot piezas)
 */
router.get('/:id', protect, simulationController.detail);

/**
 * GET /api/simulations/:id/results
 * Solo ranking/tiempos
 */
router.get('/:id/results', protect, simulationController.results);

module.exports = router;
