const express = require('express');
const router = express.Router();
const carSetupController = require('../controllers/carSetupController');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/car-setup/cars
 * Obtener todos los carros del equipo del usuario
 */
router.get('/cars', protect, carSetupController.getTeamCars);

/**
 * POST /api/car-setup/cars
 * Crear un nuevo carro
 * 
 * @body {string} nombre - Nombre del carro
 */
router.post('/cars', protect, carSetupController.createCar);

/**
 * GET /api/car-setup/car/:id_carro
 * Obtener el setup actual de un carro
 * 
 * @param {number} id_carro - ID del carro
 */
router.get('/car/:id_carro', protect, carSetupController.getCarSetup);

/**
 * PUT /api/car-setup/car/:id_carro/part
 * Instalar una pieza en el setup del carro
 * 
 * @param {number} id_carro - ID del carro
 * @body {number} id_pieza - ID de la pieza a instalar
 */
router.put('/car/:id_carro/part', protect, carSetupController.installPart);

/**
 * DELETE /api/car-setup/car/:id_carro/part/:category_id
 * Remover una pieza del setup del carro
 * 
 * @param {number} id_carro - ID del carro
 * @param {number} category_id - ID de la categoría de la pieza a remover
 */
router.delete('/car/:id_carro/part/:category_id', protect, carSetupController.removePart);

/**
 * POST /api/car-setup/car/:id_carro/finalize
 * Finalizar el armado de un carro
 * 
 * @param {number} id_carro - ID del carro
 */
router.post('/car/:id_carro/finalize', protect, carSetupController.finalizeCar);

module.exports = router;