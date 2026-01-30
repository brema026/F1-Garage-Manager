// backend/routes/CarSetup.js
const express = require('express');
const router = express.Router();

const carSetupController = require('../controllers/carSetupController');
const { protect } = require('../middleware/authMiddleware');

// Ver setup actual + resumen del carro
router.get('/car/:id_carro', protect, carSetupController.getCarSetup);

// Partes disponibles (de MI inventario) por categoría
router.get('/inventory/category/:category_id', protect, carSetupController.getMyInventoryByCategory);

// Partes disponibles POR EQUIPO (Admin/Engineer)
// Admin: inventario por equipo + categoría (Engineer solo su equipo)
router.get(
  '/team/:id_equipo/inventory/category/:category_id',
  protect,
  carSetupController.getTeamInventoryByCategory
);

// Instalar o reemplazar pieza en un carro (usa SP con transacción)
router.put('/car/:id_carro/install', protect, carSetupController.installOrReplace);

// Finalizar carro si tiene 5 categorías instaladas
router.post('/car/:id_carro/finalize', protect, carSetupController.finalizeCar);


// Asignar / cambiar conductor del carro
// PUT /api/car-setup/car/:id_carro/driver
router.put('/car/:id_carro/driver', protect, carSetupController.assignDriver);

// (Opcional) quitar conductor
// PUT /api/car-setup/car/:id_carro/driver/remove
router.put('/car/:id_carro/driver/remove', protect, carSetupController.removeDriverFromCar);

module.exports = router;
