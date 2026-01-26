const carModel = require('../models/carModel');
const logger = require('../config/logger');

const carController = {
  // GET /api/cars/team/:id_equipo (Admin)
  async getCarsByTeam(req, res) {
    try {
      const rol = req.user?.rol;
      if (rol !== 'Admin') return res.status(403).json({ error: 'Rol no autorizado' });

      const id_equipo = Number(req.params.id_equipo);
      if (!id_equipo && id_equipo !== 0) return res.status(400).json({ error: 'id_equipo inválido' });

      const result = await carModel.getCarsByTeam(id_equipo);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error getCarsByTeam: ${e.message}`);
      return res.status(500).json({ error: 'Error obteniendo carros' });
    }
  },

  // GET /api/cars/my (Engineer)
  async getMyCars(req, res) {
    try {
      const rol = req.user?.rol;
      if (rol !== 'Engineer' && rol !== 'Admin') return res.status(403).json({ error: 'Rol no autorizado' });

      const myTeam = Number(req.user?.id_equipo);
      if (!myTeam || myTeam === 0) return res.status(400).json({ error: 'No tienes equipo asignado' });

      const result = await carModel.getMyCars(myTeam);
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error getMyCars: ${e.message}`);
      return res.status(500).json({ error: 'Error obteniendo mis carros' });
    }
  },

  // POST /api/cars/team/:id_equipo (Admin)  -> crea 1 carro
  async createCarForTeam(req, res) {
    try {
      const rol = req.user?.rol;
      if (rol !== 'Admin') return res.status(403).json({ error: 'Rol no autorizado' });

      const id_equipo = Number(req.params.id_equipo);
      const nombre = (req.body?.nombre || '').trim();

      if (!id_equipo && id_equipo !== 0) return res.status(400).json({ error: 'id_equipo inválido' });
      if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

      const result = await carModel.createCar(id_equipo, nombre);
      return res.status(200).json(result.recordset?.[0] || { message: 'Carro creado' });
    } catch (e) {
      logger.error(`Error createCarForTeam: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  },

  // POST /api/cars/my/generate (Engineer) -> crea 2 carros para su equipo (si no existen)
  async generateMyCars(req, res) {
    try {
      const rol = req.user?.rol;
      if (rol !== 'Engineer') return res.status(403).json({ error: 'Rol no autorizado' });

      const myTeam = Number(req.user?.id_equipo);
      if (!myTeam || myTeam === 0) return res.status(400).json({ error: 'No tienes equipo asignado' });

      const baseName = (req.body?.baseName || 'Carro').trim();

      // Intentamos crear 2; el SP ya bloquea si hay >2
      const r1 = await carModel.createCar(myTeam, `${baseName} 1`);
      let r2 = null;
      try {
        r2 = await carModel.createCar(myTeam, `${baseName} 2`);
      } catch (_) {
        // si ya hay 2, el SP va a lanzar error; lo ignoramos para que sea "idempotente"
      }

      return res.status(200).json({
        message: 'Generación ejecutada',
        created: [
          r1?.recordset?.[0] || null,
          r2?.recordset?.[0] || null
        ].filter(Boolean)
      });
    } catch (e) {
      logger.error(`Error generateMyCars: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  }
};

module.exports = carController;
