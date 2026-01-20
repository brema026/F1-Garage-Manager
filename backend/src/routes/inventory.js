const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

// Engineer/Admin: ver inventario de MI equipo
router.get('/my', protect, inventoryController.getMyInventory);

// (Opcional) Admin: ver inventario por equipo
router.get('/team/:id_equipo', protect, inventoryController.getInventoryByTeam);

// Reducir cantidad (Admin o Engineer dueño)
router.put('/team/:id_equipo/part/:id_pieza/remove', protect, inventoryController.reduceInventoryItem);

// Eliminar ítem completo (Admin o Engineer dueño)
router.delete('/team/:id_equipo/part/:id_pieza', protect, inventoryController.deleteInventoryItem);


module.exports = router;
