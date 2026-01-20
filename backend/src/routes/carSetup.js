const express = require('express');
const router = express.Router();
const carSetupController = require('../controllers/carSetupController');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/car-setup/categories
 * Obtener categorías disponibles
 */
router.get('/categories', protect, carSetupController.getCategories);

/**
 * GET /api/car-setup/team/:teamId/cars
 * Obtener carros de un equipo
 */
router.get('/team/:teamId/cars', protect, carSetupController.getTeamCars);

/**
 * GET /api/car-setup/team/:teamId/inventory
 * Obtener inventario de partes del equipo
 */
router.get('/team/:teamId/inventory', protect, carSetupController.getTeamInventory);

/**
 * GET /api/car-setup/team/:teamId/drivers
 * Obtener conductores del equipo
 */
router.get('/team/:teamId/drivers', protect, carSetupController.getTeamDrivers);

/**
 * POST /api/car-setup/car
 * Crear un nuevo carro
 */
router.post('/car', protect, carSetupController.createCar);

/**
 * PUT /api/car-setup/car/:carId/part
 * Instalar o reemplazar una parte en un carro
 */
router.put('/car/:carId/part', protect, carSetupController.installPart);

/**
 * PUT /api/car-setup/car/:carId/driver
 * Asignar conductor a un carro
 */
router.put('/car/:carId/driver', protect, carSetupController.assignDriver);

/**
 * PUT /api/car-setup/car/:carId/finalize
 * Finalizar configuración de un carro
 */
router.put('/car/:carId/finalize', protect, carSetupController.finalizeCar);

/**
 * DELETE /api/car-setup/car/:carId/part/:categoria_id
 * Desinstalar una parte de un carro
 */
router.delete('/car/:carId/part/:categoria_id', protect, carSetupController.uninstallPart);

module.exports = router;    