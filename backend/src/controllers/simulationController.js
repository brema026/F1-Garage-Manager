const simulationModel = require('../models/simulationModel');
const logger = require('../config/logger');

function normalizeUser(req) {
  return {
    id_usuario: Number(req.user?.id_usuario),
    rol: req.user?.rol,
    id_equipo: req.user?.id_equipo != null ? Number(req.user?.id_equipo) : null,
    // Si tu middleware ya mete id_conductor, úsalo.
    // Si no, puedes agregar endpoint/model para resolverlo por id_usuario.
    id_conductor: req.user?.id_conductor != null ? Number(req.user?.id_conductor) : null
  };
}

const simulationController = {
  // ==========================================
  // POST /api/simulations
  // Admin only: ejecutar simulación
  // body: { id_circuito }
  // ==========================================
  async run(req, res) {
    try {
      const u = normalizeUser(req);

      if (!u.id_usuario || !u.rol) {
        return res.status(401).json({ error: 'Sesión inválida' });
      }
      if (u.rol !== 'Admin') {
        return res.status(403).json({ error: 'No autorizado (solo Admin puede ejecutar simulaciones)' });
      }

      const id_circuito = Number(req.body?.id_circuito);
      if (!id_circuito) {
        return res.status(400).json({ error: 'id_circuito es requerido' });
      }

      const result = await simulationModel.runSimulation(id_circuito, u.id_usuario);
      const rows = result.recordset || [];

      // El SP retorna ranking + id_simulacion en cada fila
      const id_simulacion = rows?.[0]?.id_simulacion ? Number(rows[0].id_simulacion) : null;

      logger.info(`Simulación ejecutada por usuario ${u.id_usuario} en circuito ${id_circuito}. SimID=${id_simulacion}`);

      return res.status(201).json({
        id_simulacion,
        resultados: rows
      });

    } catch (e) {
      // Cuando el SP hace RAISERROR, cae aquí con mensaje útil
      logger.error(`Error ejecutando simulación: ${e.message}`);
      return res.status(500).json({ error: e.message || 'Error ejecutando simulación' });
    }
  },

  // ==========================================
  // GET /api/simulations
  // Admin: todas
  // Engineer: solo donde su equipo participó
  // Driver: solo donde participó
  // query: ?limit=50&offset=0
  // ==========================================
  async list(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) {
        return res.status(401).json({ error: 'Sesión inválida' });
      }

      const limit = Number(req.query?.limit);
      const offset = Number(req.query?.offset);

      // Para Driver, necesitamos id_conductor.
      // Si aún no lo tienes en req.user, puedes devolver 400 con msg claro.
      if (u.rol === 'Driver' && !u.id_conductor) {
        return res.status(400).json({
          error: 'Falta id_conductor en sesión. Agrega id_conductor al middleware o resuélvelo por id_usuario.'
        });
      }

      // Para Engineer, necesita id_equipo válido
      if (u.rol === 'Engineer' && (u.id_equipo == null || Number.isNaN(u.id_equipo))) {
        return res.status(400).json({ error: 'Engineer sin id_equipo asignado' });
      }

      const result = await simulationModel.listSimulations({
        id_usuario: u.id_usuario,
        rol: u.rol,
        id_equipo: u.id_equipo,
        id_conductor: u.id_conductor,
        limit,
        offset
      });

      return res.status(200).json(result.recordset || []);
    } catch (e) {
      logger.error(`Error listando simulaciones: ${e.message}`);
      return res.status(500).json({ error: 'Error listando simulaciones' });
    }
  },

  // ==========================================
  // GET /api/simulations/:id
  // Devuelve: header + resultados + snapshot piezas
  // Acceso:
  // - Admin: ok
  // - Engineer: solo si su equipo participó
  // - Driver: solo si participó
  // ==========================================
  async detail(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const id_simulacion = Number(req.params.id);
      if (!id_simulacion) return res.status(400).json({ error: 'id_simulacion inválido' });

      // Primero, traer resultados para validar acceso por participación
      const results = await simulationModel.getSimulationResults(id_simulacion);
      const participantes = results.recordset || [];

      if (participantes.length === 0) {
        return res.status(404).json({ error: 'Simulación no encontrada o sin participantes' });
      }

      // Control de acceso por rol
      if (u.rol === 'Engineer') {
        const ok = participantes.some(r => Number(r.id_equipo) === Number(u.id_equipo));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }
      if (u.rol === 'Driver') {
        if (!u.id_conductor) {
          return res.status(400).json({ error: 'Falta id_conductor en sesión' });
        }
        const ok = participantes.some(r => Number(r.id_conductor) === Number(u.id_conductor));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }
      // Admin => ok

      const header = await simulationModel.getSimulationHeader(id_simulacion);
      const headerRow = header.recordset?.[0] || null;

      const pieces = await simulationModel.getSimulationPiecesSnapshot(id_simulacion);
      const piezas = pieces.recordset || [];

      // Agrupar piezas por carro para frontend
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

  // ==========================================
  // GET /api/simulations/:id/results
  // Solo ranking (más simple)
  // ==========================================
  async results(req, res) {
    try {
      const u = normalizeUser(req);
      if (!u.id_usuario || !u.rol) return res.status(401).json({ error: 'Sesión inválida' });

      const id_simulacion = Number(req.params.id);
      if (!id_simulacion) return res.status(400).json({ error: 'id_simulacion inválido' });

      const results = await simulationModel.getSimulationResults(id_simulacion);
      const participantes = results.recordset || [];

      if (participantes.length === 0) return res.status(404).json({ error: 'Simulación no encontrada' });

      // Control acceso igual que detail (sin piezas)
      if (u.rol === 'Engineer') {
        const ok = participantes.some(r => Number(r.id_equipo) === Number(u.id_equipo));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }
      if (u.rol === 'Driver') {
        if (!u.id_conductor) return res.status(400).json({ error: 'Falta id_conductor en sesión' });
        const ok = participantes.some(r => Number(r.id_conductor) === Number(u.id_conductor));
        if (!ok) return res.status(403).json({ error: 'No autorizado' });
      }

      return res.status(200).json(participantes);
    } catch (e) {
      logger.error(`Error resultados simulación: ${e.message}`);
      return res.status(500).json({ error: 'Error resultados simulación' });
    }
  }
};

module.exports = simulationController;

