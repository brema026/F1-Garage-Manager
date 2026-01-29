const simulationModel = require('../models/simulationModel');
const logger = require('../config/logger');

function normalizeUser(req) {
  return {
    id_usuario: req.user?.id_usuario != null ? Number(req.user.id_usuario) : null,
    rol: req.user?.rol,
    id_equipo: req.user?.id_equipo != null ? Number(req.user.id_equipo) : null,
  };
}

const simulationController = {
  // POST /api/simulations  (Admin only)
  async run(req, res) {
    try {
      const u = normalizeUser(req);

      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });
      if (String(u.rol) !== 'Admin') return res.status(403).json({ error: 'No autorizado (solo Admin puede ejecutar simulaciones)' });

      const id_circuito = Number(req.body?.id_circuito);
      if (!id_circuito) return res.status(400).json({ error: 'id_circuito es requerido' });

      const result = await simulationModel.runSimulation(id_circuito, u.id_usuario);

      // SP debe devolver recordset con ranking + id_simulacion
      const rows = result?.recordset || [];
      const id_simulacion = rows?.[0]?.id_simulacion != null ? Number(rows[0].id_simulacion) : null;

      if (!id_simulacion) {
        // Esto es la causa típica de tu “id_simulacion inválido” después:
        // el SP no está devolviendo id_simulacion en recordset.
        logger.error('SP sp_ejecutar_simulacion no devolvió id_simulacion en el recordset.');
        return res.status(500).json({ error: 'El SP no devolvió id_simulacion. Asegúrate que el recordset incluya id_simulacion.' });
      }

      logger.info(`Simulación ejecutada por usuario ${u.id_usuario} en circuito ${id_circuito}. SimID=${id_simulacion}`);

      return res.status(201).json({
        id_simulacion,
        resultados: rows
      });
    } catch (e) {
      logger.error(`Error ejecutando simulación: ${e.message}`);
      return res.status(500).json({ error: e.message || 'Error ejecutando simulación' });
    }
  },

  // GET /api/simulations
  async list(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const limit = Number(req.query?.limit);
      const offset = Number(req.query?.offset);

      if (u.rol === 'Engineer' && (u.id_equipo == null || Number.isNaN(u.id_equipo))) {
        return res.status(400).json({ error: 'Engineer sin id_equipo asignado' });
      }

      const result = await simulationModel.listSimulations({
        id_usuario: u.id_usuario,
        rol: u.rol,
        id_equipo: u.id_equipo,
        limit,
        offset
      });

      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error listando simulaciones: ${e.message}`);
      return res.status(500).json({ error: 'Error listando simulaciones' });
    }
  },

  // GET /api/simulations/:id (header + resultados + snapshot piezas)
  async detail(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const id_simulacion = Number(req.params.id);
      if (!id_simulacion) return res.status(400).json({ error: 'id_simulacion inválido' });

      // Traer resultados para validar existencia y acceso por equipo (tu schema no permite por conductor)
      const results = await simulationModel.getSimulationResults(id_simulacion);
      const participantes = results.recordset || [];

      if (participantes.length === 0) return res.status(404).json({ error: 'Simulación no encontrada o sin participantes' });

      // Acceso:
      // Admin: ok
      // Engineer: si su equipo participó
      // Driver: si su equipo (del conductor) participó
      if (u.rol === 'Engineer') {
        const ok = participantes.some(r => Number(r.id_equipo) === Number(u.id_equipo));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }

      if (u.rol === 'Driver') {
        // resolvemos el equipo del driver por conductor.id_usuario
        const con = await simulationModel.getConductorByUser(u.id_usuario);
        const row = con.recordset?.[0];
        const equipoDriver = row?.id_equipo != null ? Number(row.id_equipo) : null;

        if (!equipoDriver) return res.status(403).json({ error: 'No autorizado (driver sin conductor/equipo)' });

        const ok = participantes.some(r => Number(r.id_equipo) === equipoDriver);
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }

      const header = await simulationModel.getSimulationHeader(id_simulacion);
      const headerRow = header.recordset?.[0] || null;

      const pieces = await simulationModel.getSimulationPiecesSnapshot(id_simulacion);
      const piezas = pieces.recordset || [];

      const piezasPorCarro = {};
      for (const p of piezas) {
        const carId = Number(p.id_carro);
        if (!piezasPorCarro[carId]) piezasPorCarro[carId] = [];
        piezasPorCarro[carId].push({
          category_id: Number(p.category_id),
          categoria_nombre: p.categoria_nombre,
          part_id: Number(p.part_id),
          part_nombre: p.part_nombre,
          p: Number(p.p),
          a: Number(p.a),
          m: Number(p.m)
        });
      }

      return res.status(200).json({
        simulacion: headerRow,
        resultados: participantes,
        setup_snapshot: piezasPorCarro
      });
    } catch (e) {
      logger.error(`Error detalle simulación: ${e.message}`);
      return res.status(500).json({ error: 'Error detalle simulación' });
    }
  },

  // GET /api/simulations/:id/results
  async results(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const id_simulacion = Number(req.params.id);
      if (!id_simulacion) return res.status(400).json({ error: 'id_simulacion inválido' });

      const results = await simulationModel.getSimulationResults(id_simulacion);
      const participantes = results.recordset || [];

      if (participantes.length === 0) return res.status(404).json({ error: 'Simulación no encontrada' });

      if (u.rol === 'Engineer') {
        const ok = participantes.some(r => Number(r.id_equipo) === Number(u.id_equipo));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }

      if (u.rol === 'Driver') {
        const con = await simulationModel.getConductorByUser(u.id_usuario);
        const row = con.recordset?.[0];
        const equipoDriver = row?.id_equipo != null ? Number(row.id_equipo) : null;

        if (!equipoDriver) return res.status(403).json({ error: 'No autorizado (driver sin conductor/equipo)' });

        const ok = participantes.some(r => Number(r.id_equipo) === equipoDriver);
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }

      return res.status(200).json(participantes);
    } catch (e) {
      logger.error(`Error resultados simulación: ${e.message}`);
      return res.status(500).json({ error: 'Error resultados simulación' });
    }
  },

  // GET /api/simulations/eligible-cars
  async eligibleCars(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const result = await simulationModel.getEligibleCarsForSimulation();
      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error eligible-cars: ${e.message}`);
      return res.status(500).json({ error: 'Error obteniendo carros elegibles' });
    }
  },
};

module.exports = simulationController;


