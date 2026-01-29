const { getPool } = require('../config/database');
const sql = require('mssql');

const simulationModel = {
  // Ejecuta la simulación (SP) y retorna resultados (ranking)
  async runSimulation(id_circuito, id_usuario) {
    const pool = await getPool();

    return pool.request()
      .input('id_circuito', sql.Int, Number(id_circuito))
      .input('id_usuario', sql.Int, id_usuario != null ? Number(id_usuario) : null)
      .execute('dbo.sp_ejecutar_simulacion');
  },

  // Lista simulaciones con control por rol:
  // - Admin: todas
  // - Engineer: solo donde su equipo participó
  // - Driver: solo donde su conductor participó
  async listSimulations({ id_usuario, rol, id_equipo, id_conductor, limit = 50, offset = 0 }) {
    const pool = await getPool();

    // Protegemos límites
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    // Query base
    // simulacion(id_simulacion, id_circuito, fecha_hora, id_usuario)
    // circuito(nombre)
    // simulacion_participante (id_simulacion, id_carro, id_equipo, id_conductor, posicion, tiempo_segundos, etc.)
    let where = '1=1';
    const req = pool.request();

    if (rol === 'Engineer') {
      where = 'EXISTS (SELECT 1 FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion AND sp.id_equipo = @id_equipo)';
      req.input('id_equipo', sql.Int, Number(id_equipo));
    } else if (rol === 'Driver') {
      // Preferible filtrar por id_conductor (si tu middleware lo trae o lo puedes obtener)
      where = 'EXISTS (SELECT 1 FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion AND sp.id_conductor = @id_conductor)';
      req.input('id_conductor', sql.Int, Number(id_conductor));
    } // Admin => sin filtro

    req.input('limit', sql.Int, safeLimit);
    req.input('offset', sql.Int, safeOffset);

    const query = `
      SELECT
        s.id_simulacion,
        s.fecha_hora,
        s.id_circuito,
        c.nombre AS circuito_nombre,
        s.id_usuario AS ejecutada_por_usuario,

        -- métricas resumidas
        (SELECT COUNT(*) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS total_participantes,
        (SELECT MIN(sp.tiempo_segundos) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS mejor_tiempo,
        (SELECT MAX(sp.tiempo_segundos) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS peor_tiempo

      FROM dbo.simulacion s
      JOIN dbo.circuito c ON c.id_circuito = s.id_circuito
      WHERE ${where}
      ORDER BY s.fecha_hora DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    return req.query(query);
  },

  // Detalle de simulación (cabecera)
  async getSimulationHeader(id_simulacion) {
    const pool = await getPool();

    return pool.request()
      .input('id_simulacion', sql.Int, Number(id_simulacion))
      .query(`
        SELECT
          s.id_simulacion,
          s.fecha_hora,
          s.id_circuito,
          c.nombre AS circuito_nombre,
          c.distancia_d,
          c.curvas_c,
          s.id_usuario AS ejecutada_por_usuario
        FROM dbo.simulacion s
        JOIN dbo.circuito c ON c.id_circuito = s.id_circuito
        WHERE s.id_simulacion = @id_simulacion;
      `);
  },

  // Resultados (participantes) de una simulación
  async getSimulationResults(id_simulacion) {
    const pool = await getPool();

    return pool.request()
      .input('id_simulacion', sql.Int, Number(id_simulacion))
      .query(`
        SELECT
          sp.id_simulacion,
          sp.posicion,
          sp.id_equipo,
          e.nombre AS equipo_nombre,
          sp.id_carro,
          ca.nombre AS carro_nombre,
          sp.id_conductor,
          co.nombre AS conductor_nombre,

          sp.setup_id,
          sp.total_p, sp.total_a, sp.total_m, sp.habilidad_h,
          sp.vrecta, sp.vcurva, sp.penalizacion, sp.tiempo_segundos
        FROM dbo.simulacion_participante sp
        JOIN dbo.equipo e ON e.id_equipo = sp.id_equipo
        JOIN dbo.carro ca ON ca.id_carro = sp.id_carro
        JOIN dbo.conductor co ON co.id_conductor = sp.id_conductor
        WHERE sp.id_simulacion = @id_simulacion
        ORDER BY sp.posicion ASC;
      `);
  },

  // Snapshot de piezas por carro/categoría
  async getSimulationPiecesSnapshot(id_simulacion) {
    const pool = await getPool();

    return pool.request()
      .input('id_simulacion', sql.Int, Number(id_simulacion))
      .query(`
        SELECT
          spp.id_simulacion,
          spp.id_carro,
          spp.category_id,
          pc.nombre AS categoria_nombre,
          spp.part_id,
          spp.part_nombre,
          spp.p, spp.a, spp.m
        FROM dbo.simulacion_participante_pieza spp
        JOIN dbo.part_category pc ON pc.category_id = spp.category_id
        WHERE spp.id_simulacion = @id_simulacion
        ORDER BY spp.id_carro ASC, spp.category_id ASC;
      `);
  }
};

module.exports = simulationModel;

