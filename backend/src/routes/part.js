const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, partController.getParts);

// Admin
router.post('/', protect, partController.registerPart);
router.put('/:id_pieza/stock', protect, partController.addStock);

// Engineer compra
router.post('/buy', protect, partController.buyPart);

// Admin: reducir stock
router.put('/:id_pieza/reduce-stock', protect, partController.reduceStock);

// Admin: eliminar pieza completa
router.delete('/:id_pieza', protect, partController.deletePart);

module.exports = router;