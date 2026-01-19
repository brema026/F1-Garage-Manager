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

module.exports = router;