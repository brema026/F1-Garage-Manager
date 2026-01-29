const express = require('express');
const router = express.Router();

const simulationController = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * POST /api/simulations/run
 * Ejecuta simulación (SP dbo.sp_ejecutar_simulacion)
 */
router.post('/run', protect, simulationController.run);

module.exports = router;
