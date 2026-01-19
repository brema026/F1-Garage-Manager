const partModel = require('../models/partModel');
const logger = require('../config/logger');

const partController = {

    // Registrar nueva pieza
    async registerPart(req, res) {
        try {
            if (req.user.rol !== 'Admin') {
                return res.status(403).json({ error: 'You do not have permission to register parts' });
            }

            const {
                nombre,
                precio,
                p,
                a,
                m,
                categoria_id,
                stock_inicial
            } = req.body;

            logger.info(`registerPart body: ${JSON.stringify(req.body)}`);
            if (
                !nombre || precio == null || p == null || a == null || m == null ||
                !categoria_id || stock_inicial == null
            ) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await partModel.registerPart({
                nombre,
                precio,
                p,
                a,
                m,
                categoria_id,
                stock_inicial
            });

            logger.info(`Part registered by ${req.user.nombre}: ${nombre}`);
            res.status(201).json(result.recordset[0]);

        } catch (e) {
            logger.error(`Error registering part: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    },

    // Agregar stock a una pieza
    async addStock(req, res) {
        try {
            if (req.user.rol !== 'Admin') {
                return res.status(403).json({ error: 'You do not have permission to update stock' });
            }

            const { id_pieza } = req.params;
            const { cantidad } = req.body;

            if (!cantidad) {
                return res.status(400).json({ error: 'Quantity is required' });
            }

            const result = await partModel.addStock(id_pieza, cantidad);

            logger.info(`Stock updated for part ${id_pieza} by ${req.user.nombre}`);
            res.status(200).json(result.recordset[0]);

        } catch (e) {
            logger.error(`Error updating stock: ${e.message}`);
            res.status(500).json({ error: e.message });
        }
    },

    // Listar piezas
    async getParts(req, res) {
        try {
            const result = await partModel.getAllParts();
            res.status(200).json(result.recordset);

        } catch (e) {
            logger.error(`Error fetching parts: ${e.message}`);
            res.status(500).json({ error: 'Error fetching parts' });
        }
    }

};

module.exports = partController;
