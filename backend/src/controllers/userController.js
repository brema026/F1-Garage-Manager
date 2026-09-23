const userModel = require('../models/userModel');
const logger = require('../config/logger');
const { publicUser } = require('../security/userResponse');

// Controller for user-related operations
const userController = {
    // Get all engineers
    async getEngineers(req, res) {
        try {
            const result = await userModel.getUsersByRole('engineer');
            res.status(200).json(result.recordset.map(publicUser));
            
        } catch (e) {
            logger.error(`Error fetching engineers: [internal error]`);
            res.status(500).json({ error: 'Error fetching engineers' });
        }
    },

    // Get all drivers
    async getDrivers(req, res) {
        try {
            const result = await userModel.getAllDrivers();
            const rows = req.user.rol === 'Engineer'
                ? result.recordset.filter(row => Number(req.user.id_equipo) > 0 && Number(row.id_equipo) === Number(req.user.id_equipo))
                : result.recordset;
            res.status(200).json(rows.map(publicUser));

        } catch (e) {
            logger.error(`Error fetching drivers: [internal error]`);
            res.status(500).json({ error: 'Error fetching drivers' });
        }
    },

    // Assign a team to a user
    async assignTeam(req, res) {
        const { id_usuario } = req.params;
        const { id_equipo, id_conductor } = req.body;
        try {
            const cleanUserId = id_usuario === 'null' ? null : id_usuario;
            await userModel.assignTeam(cleanUserId, id_equipo, id_conductor);
            res.status(200).json({ message: 'Team assigned successfully' });

        } catch (e) {
            logger.error(`Error assigning team: [internal error]`);
            res.status(500).json({ error: 'Failed to assign team' });
        }
    },

    // Create a new driver
    async createDriver(req, res) {
        try {
            const { nombre, id_equipo, habilidad } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: 'Name is required' });
            }

            await userModel.createDriverProfile({
                nombre,
                id_equipo,
                habilidad
            });

            logger.info(`Driver '${nombre}' created by ADMIN_${req.user.nombre}`);
            res.status(201).json({ 
                status: 'PROFILE_CREATED',
                message: 'Driver profile initialized without login credentials.' 
            });

        } catch (e) {
            logger.error(`Error creating driver profile: [internal error]`);
            res.status(500).json({ error: 'Error creating driver profile' });
        }
    },

    // Update driver's skill level
    async updateSkill(req, res) {
        const { id_conductor } = req.params; 
        const { habilidad } = req.body;
        
        try {
            const result = await userModel.updateDriverSkill(id_conductor, habilidad);
            
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            res.status(200).json({ 
                status: 'SUCCESS', 
                message: `Driver skill updated for conductor ${id_conductor}` 
            });

        } catch (e) {
            logger.error(`Error updating skill for conductor ID_${id_conductor}: [internal error]`);
            res.status(500).json({ error: 'Error updating driver skill' });
        }
    }
};

// Export the user controller for use in routes
module.exports = userController;
