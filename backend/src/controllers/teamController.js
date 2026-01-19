const teamModel = require('../models/teamModel');
const logger = require('../config/logger');

// Controller for team-related operations
const teamController = {
    // Get list of teams
    async getTeams(req, res) {
        try {
            const result = await teamModel.getAllTeams(req.user.id_usuario, req.user.rol);
            res.status(200).json(result.recordset);

        } catch (e) {
            logger.error(`Error while fetching teams: ${e.message}`);
            res.status(500).json({ error: 'Error while fetching teams' });
        }
    },

    // Create a new team
    async createTeam(req, res) {
        try {
            if (req.user.rol !== 'Admin') {
                return res.status(403).json({ error: 'You do not have permission to create teams' });
            }

            const { nombre } = req.body;
            if (!nombre) return res.status(400).json({ error: 'Name is required' });

            const result = await teamModel.createTeam(nombre);
            logger.info(`Team created by ${req.user.nombre}: ${nombre}`);
            res.status(201).json(result.recordset[0]);
        } catch (e) {
            logger.error(`Error creating team: ${e.message}`);
            res.status(500).json({ error: 'Error creating team' });
        }
    },

    // Update an existing team just its name
    async updateTeam(req, res) {
        try {
            if (req.user.rol !== 'Admin') {
                return res.status(403).json({ error: 'You do not have permission to edit teams' });
            }

            const { id } = req.params;
            const { nombre } = req.body;

            if (!nombre) return res.status(400).json({ error: 'Name is required' });

            const result = await teamModel.updateTeam(id, nombre);
            
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Team not found' });
            }

            logger.info(`Team ID ${id} updated by ${req.user.nombre} to: ${nombre}`);
            res.status(200).json(result.recordset[0]);
        } catch (e) {
            logger.error(`Error updating team: ${e.message}`);
            res.status(500).json({ error: 'Error updating team' });
        }
    }
};

// Export the team controller for use in routes
module.exports = teamController;