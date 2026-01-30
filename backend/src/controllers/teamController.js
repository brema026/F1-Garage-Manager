const teamModel = require('../models/teamModel');
const logger = require('../config/logger');

// Controller for team-related operations
const teamController = {
  // ================================
  // GET /api/teams
  // Lista equipos según rol (Admin: todos, Engineer: solo su equipo)
  // Ahora el SP puede devolver también finanzas por equipo (presupuesto/gasto/saldo)
  // ================================
  async getTeams(req, res) {
    try {
      const id_usuario = Number(req.user?.id_usuario);
      const rol = req.user?.rol;

      if (!id_usuario || !rol) {
        return res.status(401).json({ error: 'Sesión inválida' });
      }

      const result = await teamModel.getAllTeams(id_usuario, rol);
      return res.status(200).json(result.recordset || []);

    } catch (e) {
      logger.error(`Error while fetching teams: ${e.message}`);
      return res.status(500).json({ error: 'Error while fetching teams' });
    }
  },

  // ================================
  // POST /api/teams  (Admin only)
  // Crear equipo
  // ================================
  async createTeam(req, res) {
    try {
      if (req.user?.rol !== 'Admin') {
        return res.status(403).json({ error: 'You do not have permission to create teams' });
      }

      const { nombre } = req.body;

      if (!nombre || String(nombre).trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await teamModel.createTeam(String(nombre).trim());

      logger.info(`Team created by ${req.user?.nombre}: ${nombre}`);
      return res.status(201).json(result.recordset?.[0] || { message: 'OK' });

    } catch (e) {
      logger.error(`Error creating team: ${e.message}`);
      return res.status(500).json({ error: 'Error creating team' });
    }
  },

  // ================================
  // PUT /api/teams/:id  (Admin only)
  // Editar nombre del equipo
  // ================================
  async updateTeam(req, res) {
    try {
      if (req.user?.rol !== 'Admin') {
        return res.status(403).json({ error: 'You do not have permission to edit teams' });
      }

      const id_equipo = Number(req.params.id);
      const { nombre } = req.body;

      if (!id_equipo) {
        return res.status(400).json({ error: 'Invalid team id' });
      }

      if (!nombre || String(nombre).trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await teamModel.updateTeam(id_equipo, String(nombre).trim());

      if (!result.rowsAffected || result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }

      logger.info(`Team ID ${id_equipo} updated by ${req.user?.nombre} to: ${nombre}`);
      return res.status(200).json(result.recordset?.[0] || { message: 'OK' });

    } catch (e) {
      logger.error(`Error updating team: ${e.message}`);
      return res.status(500).json({ error: 'Error updating team' });
    }
  },

  // ================================
  // GET /api/teams/:id/finance
  // (opcional) Mantener si tu pantalla "detalle" lo usa
  // Admin o Engineer del mismo equipo
  // ================================
  async getTeamFinance(req, res) {
    try {
      const id_equipo = Number(req.params.id);
      if (!id_equipo) return res.status(400).json({ error: 'id_equipo inválido' });

      const rol = req.user?.rol;
      const myTeam = Number(req.user?.id_equipo);

      // Engineer solo puede ver su equipo; Admin puede ver cualquiera
      if (rol !== 'Admin' && !(rol === 'Engineer' && myTeam === id_equipo)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const result = await teamModel.getTeamFinance(id_equipo);

      return res.status(200).json(
        result.recordset?.[0] || {
          id_equipo,
          presupuesto_total: 0,
          gasto_total: 0,
          saldo_disponible: 0
        }
      );

    } catch (e) {
      logger?.error?.(`Error fetching team finance: ${e.message}`);
      return res.status(500).json({ error: e.message });
    }
  }
};

module.exports = teamController;
