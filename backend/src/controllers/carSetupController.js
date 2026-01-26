// backend/controllers/CarSetupController.js
const carSetupModel = require('../models/CarSetupModel');
const logger = require('../config/logger');

function isIntPos(n) {
  return Number.isInteger(n) && n > 0;
}

const carSetupController = {
  // GET /api/car-setup/car/:id_carro
  // Engineer/Admin: ver setup actual + resumen (P/A/M) + piezas por categoría
  async getCarSetup(req, res) {
    try {
      const id_carro = Number(req.params.id_carro);
      if (!isIntPos(id_carro)) return res.status(400).json({ error: 'id_carro inválido' });

      const rol = req.user?.rol;

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      // Garantiza que exista setup actual
      await carSetupModel.getOrCreateCurrentSetup(id_carro);

      const result = await carSetupModel.getCarSetupSummary(id_carro);

      const summary = result.recordsets?.[0]?.[0] || null;
      const categories = result.recordsets?.[1] || [];

      return res.status(200).json({ summary, categories });
    } catch (e) {
      logger.error(`Error fetching car setup: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching car setup' });
    }
  },

  // GET /api/car-setup/inventory/category/:category_id
  // Engineer/Admin: lista partes disponibles (del inventario de MI equipo) por categoría
  // (OJO: Admin normalmente NO tiene equipo asignado; para Admin usá el endpoint team/:id_equipo)
  async getMyInventoryByCategory(req, res) {
    try {
      const category_id = Number(req.params.category_id);
      if (!isIntPos(category_id)) return res.status(400).json({ error: 'category_id inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }
      if (!myTeam || myTeam === 0) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }

      const result = await carSetupModel.getInventoryByCategory(myTeam, category_id);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error fetching inventory by category: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching inventory by category' });
    }
  },

  // GET /api/car-setup/team/:id_equipo/inventory/category/:category_id
  // Admin: puede ver inventario de cualquier equipo
  // Engineer: solo puede ver inventario de su propio equipo
  async getTeamInventoryByCategory(req, res) {
    try {
      const id_equipo = Number(req.params.id_equipo);
      const category_id = Number(req.params.category_id);

      if (!isIntPos(id_equipo)) return res.status(400).json({ error: 'id_equipo inválido' });
      if (!isIntPos(category_id)) return res.status(400).json({ error: 'category_id inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      if (rol === 'Engineer') {
        if (!myTeam || myTeam === 0) {
          return res.status(400).json({ error: 'No tienes equipo asignado' });
        }
        if (myTeam !== id_equipo) {
          return res.status(403).json({ error: 'Solo puedes ver inventario de tu equipo' });
        }
      }

      const result = await carSetupModel.getInventoryByCategory(id_equipo, category_id);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error fetching TEAM inventory by category: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching inventory by category' });
    }
  },

  // PUT /api/car-setup/car/:id_carro/install
  // Body:
  // - Engineer: { part_id }
  // - Admin: { part_id, id_equipo }
  async installOrReplace(req, res) {
    try {
      const id_carro = Number(req.params.id_carro);
      if (!isIntPos(id_carro)) return res.status(400).json({ error: 'id_carro inválido' });

      const part_id = Number(req.body?.part_id);
      if (!isIntPos(part_id)) return res.status(400).json({ error: 'part_id inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      const selectedTeam = Number(req.body?.id_equipo); // Admin lo manda
      const teamToUse = (rol === 'Admin') ? selectedTeam : myTeam;

      if (!teamToUse || teamToUse === 0) {
        return res.status(400).json({
          error: rol === 'Admin'
            ? 'Admin debe enviar id_equipo en el body'
            : 'No tienes equipo asignado'
        });
      }

      // SP valida que el carro pertenezca al equipo (@id_equipo)
      const result = await carSetupModel.installOrReplacePart(id_carro, teamToUse, part_id);

      // devolver setup actualizado para refrescar UI
      const setup = await carSetupModel.getCarSetupSummary(id_carro);
      const summary = setup.recordsets?.[0]?.[0] || null;
      const categories = setup.recordsets?.[1] || [];

      return res.status(200).json({
        result: result.recordset?.[0] || { message: 'OK' },
        summary,
        categories
      });
    } catch (e) {
      logger.error(`Error installing/replacing part: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  },

  // POST /api/car-setup/car/:id_carro/finalize
  // Body:
  // - Engineer: {}
  // - Admin: { id_equipo }
  async finalizeCar(req, res) {
    try {
      const id_carro = Number(req.params.id_carro);
      if (!isIntPos(id_carro)) return res.status(400).json({ error: 'id_carro inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      const selectedTeam = Number(req.body?.id_equipo); // Admin lo manda
      const teamToUse = (rol === 'Admin') ? selectedTeam : myTeam;

      if (!teamToUse || teamToUse === 0) {
        return res.status(400).json({
          error: rol === 'Admin'
            ? 'Admin debe enviar id_equipo en el body'
            : 'No tienes equipo asignado'
        });
      }

      const result = await carSetupModel.finalizeCar(id_carro, teamToUse);
      return res.status(200).json(result.recordset?.[0] || { message: 'Carro finalizado' });
    } catch (e) {
      logger.error(`Error finalizing car: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  }
};

module.exports = carSetupController;

