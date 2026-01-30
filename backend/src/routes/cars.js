const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');

// Engineer/Admin
router.get('/my', protect, carController.getMyCars);

// Admin
router.get('/team/:id_equipo', protect, carController.getCarsByTeam);
router.post('/team/:id_equipo', protect, carController.createCarForTeam);

// Engineer: generar 2 carros para mi equipo
router.post('/my/generate', protect, carController.generateMyCars);

module.exports = router;
