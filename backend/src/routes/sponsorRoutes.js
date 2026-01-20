const express = require('express');
const router = express.Router();
const controller = require('../controllers/sponsorContributionController');
const { protect } = require('../middleware/authMiddleware');

// sponsors
router.get('/', protect, controller.getSponsors);
router.post('/', protect, controller.createSponsor);

// contributions (aportes)
router.post('/contributions', protect, controller.createContribution);
router.get('/contributions/team/:id_equipo', protect, controller.getContributionsByTeam);

// budget / balance
router.get('/budget/team/:id_equipo', protect, controller.getBudgetByTeam);
router.get('/balance/team/:id_equipo', protect, controller.getBalanceByTeam);

module.exports = router;
