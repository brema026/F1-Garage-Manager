const { getPool } = require('../config/database');
const sql = require('mssql');

const simulationModel = {
  async runSimulation(id_circuito, id_usuario, carros = []) {
    const pool = await getPool();

    // TVP: debe existir en SQL Server como dbo.IntList(id INT PRIMARY KEY)
    const tvp = new sql.Table('dbo.IntList');
    tvp.columns.add('id', sql.Int, { nullable: false });

    for (const c of carros) {
      const id = Number(c);
      if (Number.isInteger(id) && id > 0) tvp.rows.add(id);
    }

    return pool.request()
      .input('id_circuito', sql.Int, Number(id_circuito))
      .input('id_usuario', sql.Int, id_usuario != null ? Number(id_usuario) : null)
      .input('carros_seleccionados', tvp) // <-- clave
      .execute('dbo.sp_ejecutar_simulacion');
  },

  async getConductorByUser(id_usuario) {
    const pool = await getPool();
    return pool.request()
      .input('id_usuario', sql.Int, Number(id_usuario))
      .query(`
        SELECT TOP 1
          c.id_conductor,
          c.id_equipo,
          c.nombre,
          c.habilidad_h
        FROM dbo.conductor c
        WHERE c.id_usuario = @id_usuario;
      `);
  },

  async listSimulations({ id_usuario, rol, id_equipo, limit = 50, offset = 0 }) {
    const pool = await getPool();

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const req = pool.request();
    req.input('limit', sql.Int, safeLimit);
    req.input('offset', sql.Int, safeOffset);

    let where = '1=1';

    if (rol === 'Engineer') {
      where = `
        EXISTS (
          SELECT 1
          FROM dbo.simulacion_participante sp
          WHERE sp.id_simulacion = s.id_simulacion
            AND sp.id_equipo = @id_equipo
        )
      `;
      req.input('id_equipo', sql.Int, Number(id_equipo));
    } else if (rol === 'Driver') {
      const con = await this.getConductorByUser(id_usuario);
      const row = con.recordset?.[0];
      const equipoDriver = row?.id_equipo != null ? Number(row.id_equipo) : null;

      req.input('id_equipo_driver', sql.Int, equipoDriver ? equipoDriver : -1);

      where = `
        EXISTS (
          SELECT 1
          FROM dbo.simulacion_participante sp
          WHERE sp.id_simulacion = s.id_simulacion
            AND sp.id_equipo = @id_equipo_driver
        )
      `;
    }

    return req.query(`
      SELECT
        s.id_simulacion,
        s.fecha_hora,
        s.id_circuito,
        c.nombre AS circuito_nombre,
        s.id_usuario AS ejecutada_por_usuario,

        (SELECT COUNT(*) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS total_participantes,
        (SELECT MIN(sp.tiempo_segundos) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS mejor_tiempo,
        (SELECT MAX(sp.tiempo_segundos) FROM dbo.simulacion_participante sp WHERE sp.id_simulacion = s.id_simulacion) AS peor_tiempo

      FROM dbo.simulacion s
      JOIN dbo.circuito c ON c.id_circuito = s.id_circuito
      WHERE ${where}
      ORDER BY s.fecha_hora DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `);
  },

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

          sp.setup_id,

          sp.total_p,
          sp.total_a,
          sp.total_m,

          sp.id_conductor,
          cnd.nombre AS conductor_nombre,
          sp.habilidad_h,

          sp.vrecta,
          sp.vcurva,
          sp.penalizacion,
          sp.tiempo_segundos

        FROM dbo.simulacion_participante sp
        JOIN dbo.carro ca ON ca.id_carro = sp.id_carro
        JOIN dbo.equipo e ON e.id_equipo = sp.id_equipo
        JOIN dbo.conductor cnd ON cnd.id_conductor = sp.id_conductor
        WHERE sp.id_simulacion = @id_simulacion
        ORDER BY sp.posicion ASC;
      `);
  },

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
  },

  async getEligibleCarsForSimulation() {
    const pool = await getPool();
    return pool.request().execute('dbo.sp_listar_carros_elegibles');
  },
};

module.exports = simulationModel;


