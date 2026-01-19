const inventoryModel = require('../models/inventoryModel');
const logger = require('../config/logger');

const inventoryController = {
  async getMyInventory(req, res) {
    try {
      const id_equipo = Number(req.user?.id_equipo);

      if (!id_equipo || id_equipo === 0) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }

      const result = await inventoryModel.getInventoryByTeam(id_equipo);
      return res.status(200).json(result.recordset);

    } catch (e) {
      logger.error(`Error fetching my inventory: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching inventory' });
    }
  },

  // (Opcional) Admin puede ver inventario de cualquier equipo: /api/inventory/team/:id_equipo
  async getInventoryByTeam(req, res) {
  try {
    const id_equipo = Number(req.params.id_equipo);
    if (!id_equipo) return res.status(400).json({ error: 'id_equipo inválido' });

    const rol = req.user?.rol;
    const myTeam = Number(req.user?.id_equipo);

    // Admin: puede ver todos
    if (rol === 'Admin') {
      const result = await inventoryModel.getInventoryByTeam(id_equipo);
      return res.status(200).json(result.recordset);
    }

    // Engineer: solo su equipo
    if (rol === 'Engineer') {
      if (!myTeam || myTeam === 0) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }
      if (id_equipo !== myTeam) {
        return res.status(403).json({ error: 'No tienes permisos para ver inventario de otros equipos' });
      }

      const result = await inventoryModel.getInventoryByTeam(id_equipo);
      return res.status(200).json(result.recordset);
    }

    return res.status(403).json({ error: 'Rol no autorizado' });

  } catch (e) {
    logger.error(`Error fetching inventory by team: ${e.message}`);
    return res.status(500).json({ error: 'Error fetching inventory' });
  }
}

};

module.exports = inventoryController;
