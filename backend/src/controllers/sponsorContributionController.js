const model = require('../models/sponsorContributionModel');
const logger = require('../config/logger');

const sponsorContributionController = {
  // GET /api/sponsors  -> listar patrocinadores (Admin/Engineer)
  async getSponsors(req, res) {
    try {
      const rol = req.user?.rol;
      if (!['Admin', 'Engineer'].includes(rol)) {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      const result = await model.listSponsors();
      return res.status(200).json(result.recordset);

    } catch (e) {
      logger.error(`Error fetching sponsors: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching sponsors' });
    }
  },

  // POST /api/sponsors  -> registrar patrocinador (Admin)
  async createSponsor(req, res) {
    try {
      if (req.user?.rol !== 'Admin') {
        return res.status(403).json({ error: 'Solo Admin puede registrar patrocinadores' });
      }

      const { nombre, email } = req.body;

      if (!nombre || String(nombre).trim() === '') {
        return res.status(400).json({ error: 'nombre is required' });
      }

      const result = await model.createSponsor({
        nombre: String(nombre).trim(),
        email: email == null || String(email).trim() === '' ? null : String(email).trim(),
      });

      logger.info(`Sponsor created by ${req.user?.nombre}: ${nombre}`);
      return res.status(201).json(result.recordset?.[0] || { message: 'OK' });

    } catch (e) {
      logger.error(`Error creating sponsor: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  },

  // POST /api/sponsors/contributions -> registrar aporte (Admin)
  async createContribution(req, res) {
    try {
      if (req.user?.rol !== 'Admin') {
        return res.status(403).json({ error: 'Solo Admin puede registrar aportes' });
      }

      const { id_equipo, id_patrocinador, monto, descripcion, fecha } = req.body;

      if (!id_equipo || !id_patrocinador || monto == null) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const nMonto = Number(monto);
      if (Number.isNaN(nMonto) || nMonto <= 0) {
        return res.status(400).json({ error: 'monto debe ser > 0' });
      }

      const result = await model.createContribution({
        id_equipo: Number(id_equipo),
        id_patrocinador: Number(id_patrocinador),
        monto: nMonto,
        descripcion: descripcion == null || String(descripcion).trim() === '' ? null : String(descripcion).trim(),
        // si tu SP NO acepta fecha, no la mandés desde el model (ver nota en model)
        fecha: fecha ? new Date(fecha) : null,
      });

      logger.info(`Contribution created by ${req.user?.nombre} -> equipo ${id_equipo}, sponsor ${id_patrocinador}`);
      return res.status(201).json(result.recordset?.[0] || { message: 'OK' });

    } catch (e) {
      logger.error(`Error creating contribution: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  },

  // GET /api/sponsors/contributions/team/:id_equipo
  async getContributionsByTeam(req, res) {
    try {
      const id_equipo = Number(req.params.id_equipo);
      if (!id_equipo) return res.status(400).json({ error: 'id_equipo inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol === 'Admin') {
        const result = await model.listContributionsByTeam(id_equipo);
        return res.status(200).json(result.recordset);
      }

      if (rol === 'Engineer') {
        if (!myTeam || myTeam === 0) return res.status(400).json({ error: 'No tienes equipo asignado' });
        if (id_equipo !== myTeam) return res.status(403).json({ error: 'No tienes permisos para ver aportes de otros equipos' });

        const result = await model.listContributionsByTeam(id_equipo);
        return res.status(200).json(result.recordset);
      }

      return res.status(403).json({ error: 'Rol no autorizado' });

    } catch (e) {
      logger.error(`Error fetching contributions: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching contributions' });
    }
  },

  // GET /api/sponsors/budget/team/:id_equipo
  async getBudgetByTeam(req, res) {
    try {
      const id_equipo = Number(req.params.id_equipo);
      if (!id_equipo) return res.status(400).json({ error: 'id_equipo inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol === 'Engineer') {
        if (!myTeam || myTeam === 0) return res.status(400).json({ error: 'No tienes equipo asignado' });
        if (id_equipo !== myTeam) return res.status(403).json({ error: 'No tienes permisos para ver presupuesto de otros equipos' });
      } else if (rol !== 'Admin') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      const result = await model.getBudgetByTeam(id_equipo);
      return res.status(200).json(result.recordset?.[0] || { id_equipo, presupuesto: 0 });

    } catch (e) {
      logger.error(`Error fetching budget: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching budget' });
    }
  },

  // GET /api/sponsors/balance/team/:id_equipo  (opcional)
  async getBalanceByTeam(req, res) {
    try {
      const id_equipo = Number(req.params.id_equipo);
      if (!id_equipo) return res.status(400).json({ error: 'id_equipo inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      if (rol === 'Engineer') {
        if (!myTeam || myTeam === 0) return res.status(400).json({ error: 'No tienes equipo asignado' });
        if (id_equipo !== myTeam) return res.status(403).json({ error: 'No tienes permisos para ver saldo de otros equipos' });
      } else if (rol !== 'Admin') {
        return res.status(403).json({ error: 'Rol no autorizado' });
      }

      const result = await model.getBalanceByTeam(id_equipo);
      return res.status(200).json(result.recordset?.[0] || { id_equipo, presupuesto: 0, gasto: 0, saldo: 0 });

    } catch (e) {
      logger.error(`Error fetching balance: ${e.message}`);
      return res.status(500).json({ error: 'Error fetching balance' });
    }
  },
};

module.exports = sponsorContributionController;
