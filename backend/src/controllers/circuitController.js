const circuitModel = require('../models/circuitModel');
const logger = require('../config/logger');

const circuitController = {
    // GET /api/circuits - Obtener todos los circuitos
    async getCircuits(req, res) {
        try {
            const { id_usuario, rol } = req.user;
            
            const result = await circuitModel.getAllCircuits(id_usuario, rol);
            res.status(200).json(result.recordset);
            
            logger.info(`Circuits fetched by ${req.user.nombre} (${rol})`);
        } catch (error) {
            logger.error(`Error fetching circuits: ${error.message}`);
            res.status(500).json({ error: 'Error fetching circuits' });
        }
    },

    // GET /api/circuits/:id - Obtener circuito por ID
    async getCircuitById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await circuitModel.getCircuitById(id);
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Circuito no encontrado' });
            }
            
            res.status(200).json(result.recordset[0]);
        } catch (error) {
            if (error.message.includes('Circuito no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            logger.error(`Error fetching circuit ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: 'Error fetching circuit' });
        }
    },

    // POST /api/circuits - Crear nuevo circuito
    async createCircuit(req, res) {
        try {
            const { nombre, distancia_d, curvas_c } = req.body;
            const { id_usuario, rol } = req.user;
            
            const result = await circuitModel.createCircuit(nombre, distancia_d, curvas_c, id_usuario);
            
            logger.info(`Circuit "${nombre}" created by ${req.user.nombre}`);
            res.status(201).json(result.recordset[0]);
            
        } catch (error) {
            if (error.message.includes('Ya existe un circuito')) {
                return res.status(409).json({ error: error.message });
            }
            logger.error(`Error creating circuit: ${error.message}`);
            res.status(500).json({ error: 'Error creating circuit' });
        }
    },

    // DELETE /api/circuits/:id - Eliminar circuito
    async deleteCircuit(req, res) {
        try {
            const { id } = req.params;
            const { rol } = req.user;
            
            const result = await circuitModel.deleteCircuit(id);
            
            logger.info(`Circuit ID ${id} deleted by ${req.user.nombre}`);
            res.status(200).json({ message: result.recordset[0]?.mensaje || 'Circuito eliminado' });
            
        } catch (error) {
            if (error.message.includes('Circuito no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('No se puede eliminar')) {
                return res.status(400).json({ error: error.message });
            }
            logger.error(`Error deleting circuit ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: 'Error deleting circuit' });
        }
    }
};

module.exports = circuitController;