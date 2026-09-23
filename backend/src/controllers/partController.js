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
            logger.error(`Error registering part: [internal error]`);
            res.status(500).json({ error: 'Error interno del servidor' });
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
            logger.error(`Error updating stock: [internal error]`);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Listar piezas
    async getParts(req, res) {
        try {
            const result = await partModel.getAllParts();
            res.status(200).json(result.recordset);

        } catch (e) {
            logger.error(`Error fetching parts: [internal error]`);
            res.status(500).json({ error: 'Error fetching parts' });
        }
    },

    // Comprar pieza (Engineer)
    async buyPart(req, res) {
    try {
        // Engineer o Admin pueden comprar (si tu profe lo permite)
        const { id_equipo, id_pieza, cantidad } = req.body;

        if (!id_equipo || !id_pieza || !cantidad) {
        return res.status(400).json({ error: 'Missing required fields' });
        }

        // seguridad: evitar que un user compre para otro equipo
        if (String(req.user.id_equipo) !== String(id_equipo) && req.user.rol !== 'Admin') {
        return res.status(403).json({ error: 'No puedes comprar para otro equipo' });
        }

        const result = await partModel.buyPart(id_equipo, id_pieza, cantidad);
        return res.status(200).json(result.recordset?.[0] || { message: 'OK' });
    } catch (e) {
    logger.error(`Error buying part: [internal error]`);

    const msg = (e.message || '').toLowerCase();

    if (msg.includes('presupuesto insuficiente')) {
        return res.status(400).json({ error: 'Presupuesto insuficiente' });
    }
    if (msg.includes('stock insuficiente')) {
        return res.status(409).json({ error: 'Stock insuficiente' });
    }
    if (msg.includes('la pieza no existe') || msg.includes('cantidad debe ser mayor')) {
        return res.status(400).json({ error: 'Pieza o cantidad inválida' });
    }

    return res.status(500).json({ error: 'Error interno del servidor' });
    }
    },

      // Reducir stock de una pieza (Admin) => resta cantidad en dbo.part_stock
    async reduceStock(req, res) {
    try {
      if (req.user.rol !== 'Admin') {
        return res.status(403).json({ error: 'You do not have permission to reduce stock' });
      }

      const { id_pieza } = req.params;
      const { cantidad } = req.body;

      if (cantidad == null) {
        return res.status(400).json({ error: 'Quantity is required' });
      }

      const qty = Number(cantidad);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Quantity must be an integer > 0' });
      }

      const result = await partModel.reduceStock(Number(id_pieza), qty);
      logger.info(`Stock reduced for part ${id_pieza} by ${req.user.nombre}`);

      return res.status(200).json(result.recordset?.[0] || { message: 'OK' });
    } catch (e) {
      logger.error(`Error reducing stock: [internal error]`);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Eliminar pieza completa (Admin) => borra part_stock y pieza si cumple reglas (stock=0 y sin referencias)
    async deletePart(req, res) {
    try {
      if (req.user.rol !== 'Admin') {
        return res.status(403).json({ error: 'You do not have permission to delete parts' });
      }

      const { id_pieza } = req.params;
      const result = await partModel.deletePart(Number(id_pieza));

      logger.info(`Part deleted ${id_pieza} by ${req.user.nombre}`);
      return res.status(200).json(result.recordset?.[0] || { message: 'OK' });
    } catch (e) {
      logger.error(`Error deleting part: [internal error]`);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getBalance(req, res) {
  try {
    const { id_equipo } = req.params;

    if (String(req.user.id_equipo) !== String(id_equipo) && req.user.rol !== 'Admin') {
      return res.status(403).json({ error: 'No puedes ver finanzas de otro equipo' });
    }

    const result = await partModel.getTeamBalance(Number(id_equipo));
    return res.status(200).json(result.recordset?.[0] || {});
  } catch (e) {
    logger.error(`Error fetching balance: [internal error]`);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}




};

module.exports = partController;
