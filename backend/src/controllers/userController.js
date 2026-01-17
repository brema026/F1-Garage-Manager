const userModel = require('../models/userModel');
const logger = require('../config/logger');

// Controller for user-related operations
const userController = {
    // Get all engineers
    async getEngineers(req, res) {
        try {
            const result = await userModel.getUsersByRole('engineer');
            res.status(200).json(result.recordset);
            
        } catch (e) {
            logger.error(`Error fetching engineers: ${e.message}`);
            res.status(500).json({ error: 'Error fetching engineers' });
        }
    },

    // Get all drivers
    async getDrivers(req, res) {
        try {
            const result = await userModel.getUsersByRole('driver');
            res.status(200).json(result.recordset);

        } catch (e) {
            logger.error(`Error fetching drivers: ${e.message}`);
            res.status(500).json({ error: 'Error fetching drivers' });
        }
    },

    // Assign a team to a user
    async assignTeam(req, res) {
        const { id_usuario } = req.params;
        const { id_equipo } = req.body;
        try {
            await userModel.assignTeam(id_usuario, id_equipo);
            res.status(200).json({ message: 'Team assigned successfully' });

        } catch (e) {
            logger.error(`Error assigning team: ${e.message}`);
            res.status(500).json({ error: 'Failed to assign team' });
        }
    }
};

// Export the user controller for use in routes
module.exports = userController;