const express = require('express');
const router = express.Router();
const circuitController = require('../controllers/circuitController');
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/circuits
 * Get list of circuits endpoint
 * 
 * @route GET /api/circuits
 * @returns {Array} List of circuits
 */
router.get('/', protect, circuitController.getCircuits);

/**
 * GET /api/circuits/:id
 * Get a specific circuit
 * 
 * @route GET /api/circuits/:id
 * @param {number} id - ID of the circuit
 * @returns {Object} Circuit data
 */
router.get('/:id', protect, circuitController.getCircuitById);

/**
 * POST /api/circuits
 * Create a new circuit endpoint
 * 
 * @route POST /api/circuits
 * @body {string} nombre - Name of the circuit
 * @body {number} distancia_d - Distance in km
 * @body {number} curvas_c - Number of curves
 * @returns {Object} Created circuit
 */
router.post('/', protect, circuitController.createCircuit);

/**
 * DELETE /api/circuits/:id
 * Delete a circuit endpoint
 * 
 * @route DELETE /api/circuits/:id
 * @param {number} id - ID of the circuit to delete
 * @returns {Object} Confirmation message
 */
router.delete('/:id', protect, circuitController.deleteCircuit);

module.exports = router;