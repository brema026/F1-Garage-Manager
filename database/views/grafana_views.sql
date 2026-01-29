-- =====================================================================
-- Archivo: grafana_views.sql
-- Base de datos: f1_garage_tec
-- Descripción: Vistas para consumo de Grafana (ranking, historial de carro,
--              y relación Tiempo vs P/A/M). Diseñadas para consultas SELECT.
-- =====================================================================
USE f1_garage_tec;
GO

/* ============================================================
   NOTAS IMPORTANTES (para el equipo)
   - Estas vistas NO modifican datos (solo lectura).
   - La vista 3 (Tiempo vs P/A/M) calcula P/A/M desde las piezas
     instaladas en el setup (car_setup_pieza -> pieza).
   - Si un setup no tiene piezas asociadas, P/A/M salen como 0.
   ============================================================ */

-- ============================================================
-- VIEW: Ranking por simulación (incluye circuito)
-- Uso: Panel 1 (Ranking por simulación y por circuito)
-- Filtros esperados en Grafana:
--   WHERE id_simulacion = $simulation_id
--   (opcional) AND id_circuito = $circuito
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_ranking_simulacion
AS
SELECT
    -- Simulación / circuito
    s.id_simulacion,
    s.fecha_hora                         AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre                            AS circuito,
    ci.distancia_d,
    ci.curvas_c,

    -- Equipo / carro
    e.id_equipo,
    e.nombre                             AS equipo,
    ca.id_carro,
    ca.nombre                            AS carro,

    -- Setup usado en esa simulación
    r.setup_id,

    -- Resultado
    r.posicion,
    r.vrecta,
    r.vcurva,
    r.penalizacion,
    r.tiempo_segundos
FROM dbo.resultado_simulacion r
JOIN dbo.simulacion s   ON r.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci    ON s.id_circuito   = ci.id_circuito
JOIN dbo.carro ca       ON r.id_carro      = ca.id_carro
JOIN dbo.equipo e       ON ca.id_equipo    = e.id_equipo;
GO


-- ============================================================
-- VIEW: Comparación del mismo carro en simulaciones distintas
--       (setup vs tiempo)
-- Uso: Panel 2 (carro en múltiples simulaciones)
-- Filtro esperado en Grafana:
--   WHERE id_carro = $car_id
-- (opcional) AND id_circuito = $circuito   -- si quieren comparar por circuito
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_carro_historial
AS
SELECT
    -- Carro
    ca.id_carro,
    ca.nombre                            AS carro,
    e.id_equipo,
    e.nombre                             AS equipo,

    -- Simulación / circuito
    s.id_simulacion,
    s.fecha_hora                         AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre                            AS circuito,

    -- Setup y resultado
    r.setup_id,
    r.tiempo_segundos,
    r.vrecta,
    r.vcurva,
    r.penalizacion,
    r.posicion
FROM dbo.resultado_simulacion r
JOIN dbo.simulacion s   ON r.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci    ON s.id_circuito   = ci.id_circuito
JOIN dbo.carro ca       ON r.id_carro      = ca.id_carro
JOIN dbo.equipo e       ON ca.id_equipo    = e.id_equipo;
GO


-- ============================================================
-- VIEW: Relación Tiempo (tiempo_segundos) vs P, A, M
-- Uso: Panel 3 (Scatter/Line: tiempo vs P/A/M)
-- Cómo calcula P/A/M:
--   suma(pieza.p), suma(pieza.a), suma(pieza.m) para el setup usado
-- Filtro esperado en Grafana:
--   WHERE id_simulacion = $simulation_id
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_tiempo_vs_pam
AS
SELECT
    -- Simulación / circuito (útil para filtrar y mostrar)
    s.id_simulacion,
    s.fecha_hora                         AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre                            AS circuito,

    -- Carro / equipo
    ca.id_carro,
    ca.nombre                            AS carro,
    e.id_equipo,
    e.nombre                             AS equipo,

    -- Setup usado y resultado
    r.setup_id,
    r.tiempo_segundos,
    r.vrecta,
    r.vcurva,
    r.penalizacion,

    -- P/A/M calculados desde piezas instaladas en el setup
    COALESCE(SUM(CAST(pz.p AS INT)), 0)  AS p_total,
    COALESCE(SUM(CAST(pz.a AS INT)), 0)  AS a_total,
    COALESCE(SUM(CAST(pz.m AS INT)), 0)  AS m_total
FROM dbo.resultado_simulacion r
JOIN dbo.simulacion s         ON r.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci          ON s.id_circuito   = ci.id_circuito
JOIN dbo.carro ca             ON r.id_carro      = ca.id_carro
JOIN dbo.equipo e             ON ca.id_equipo    = e.id_equipo
LEFT JOIN dbo.car_setup_pieza csp
    ON csp.setup_id = r.setup_id
LEFT JOIN dbo.pieza pz
    ON pz.id_pieza = csp.part_id
GROUP BY
    s.id_simulacion,
    s.fecha_hora,
    ci.id_circuito,
    ci.nombre,
    ca.id_carro,
    ca.nombre,
    e.id_equipo,
    e.nombre,
    r.setup_id,
    r.tiempo_segundos,
    r.vrecta,
    r.vcurva,
    r.penalizacion;
GO
