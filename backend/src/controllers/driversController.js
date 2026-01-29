const driversModel = require('../models/driversModel');
const logger = require('../config/logger');

function isIntPos(n) {
  return Number.isInteger(n) && n > 0;
}

const driversController = {
  // GET /api/drivers/my
  async getMyDrivers(req, res) {
    try {
      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }
      if (!isIntPos(myTeam)) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }

      const result = await driversModel.getDriversByTeam(myTeam);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error fetching my drivers: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching drivers' });
    }
  },

  // GET /api/drivers/team/:id_equipo
  async getDriversByTeam(req, res) {
    try {
      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      const id_equipo = Number(req.params.id_equipo);
      if (!isIntPos(id_equipo)) return res.status(400).json({ error: 'id_equipo inválido' });

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      if (rol === 'Engineer') {
        if (!isIntPos(myTeam)) return res.status(400).json({ error: 'No tienes equipo asignado' });
        if (myTeam !== id_equipo) return res.status(403).json({ error: 'Solo puedes ver conductores de tu equipo' });
      }

      const result = await driversModel.getDriversByTeam(id_equipo);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error fetching team drivers: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching drivers' });
    }
  }
};

module.exports = driversController;
