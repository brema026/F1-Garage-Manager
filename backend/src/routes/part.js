const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, partController.getParts);
router.post('/', protect, partController.registerPart);
router.put('/:id_pieza/stock', protect, partController.addStock);

module.exports = router;

