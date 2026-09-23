const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, partController.getParts);

// Admin
router.post('/', protect, partController.registerPart);
router.put('/:id_pieza/stock', protect, partController.addStock);

// Engineer compra
router.post('/buy', protect, requireRole('Admin', 'Engineer'), partController.buyPart);

// Admin: reducir stock
router.put('/:id_pieza/reduce-stock', protect, partController.reduceStock);

// Admin: eliminar pieza completa
router.delete('/:id_pieza', protect, partController.deletePart);

router.get('/team/:id_equipo/balance', protect, requireRole('Admin', 'Engineer'), partController.getBalance);


module.exports = router;
