const express = require('express');
const router = express.Router();

const driversController = require('../controllers/driversController');
const { protect } = require('../middleware/authMiddleware');

// Engineer/Admin: mis conductores (mi equipo)
router.get('/my', protect, driversController.getMyDrivers);

// Admin/Engineer: conductores por equipo (Engineer solo su equipo)
router.get('/team/:id_equipo', protect, driversController.getDriversByTeam);

module.exports = router;