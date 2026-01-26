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

      // Driver: solo lectura pero normalmente no “arma”; si querés permitir view, déjalo.
      // Aquí lo dejo como solo Admin/Engineer para evitar exposición.
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

  // PUT /api/car-setup/car/:id_carro/install
  // Body: { part_id }
  // Engineer/Admin: instalar o reemplazar (reglas en SP + transacción)
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
      if (!myTeam || myTeam === 0) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }

      // Nota: Aquí el SP valida que el carro pertenezca al equipo (@id_equipo)
      const result = await carSetupModel.installOrReplacePart(id_carro, myTeam, part_id);

      // opcional: devolver setup actualizado para refrescar UI
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
      // Si el SP hace RAISERROR, mssql suele mandar mensaje útil en e.message
      return res.status(500).json({ error: e.message });
    }
  },

  // POST /api/car-setup/car/:id_carro/finalize
  // Engineer/Admin: marcar carro como finalizado (solo si tiene 5 categorías)
  async finalizeCar(req, res) {
    try {
      const id_carro = Number(req.params.id_carro);
      if (!isIntPos(id_carro)) return res.status(400).json({ error: 'id_carro inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol !== 'Admin' && rol !== 'Engineer') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }
      if (!myTeam || myTeam === 0) {
        return res.status(400).json({ error: 'No tienes equipo asignado' });
      }

      const result = await carSetupModel.finalizeCar(id_carro, myTeam);
      return res.status(200).json(result.recordset?.[0] || { message: 'Carro finalizado' });

    } catch (e) {
      logger.error(`Error finalizing car: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  }
};

module.exports = carSetupController;
