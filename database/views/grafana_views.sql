USE f1_garage_tec;
GO

-- ============================================================
-- VIEW 1: Ranking por simulación
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_ranking_simulacion
AS
SELECT
    -- Simulación / circuito
    s.id_simulacion,
    s.fecha_hora AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre AS circuito,
    ci.distancia_d,
    ci.curvas_c,

    -- Equipo / carro
    sp.id_equipo,
    e.nombre AS equipo,
    sp.id_carro,
    ca.nombre AS carro,

    -- Setup usado
    sp.setup_id,

    -- Resultado
    sp.posicion,
    sp.vrecta,
    sp.vcurva,
    sp.penalizacion,
    sp.tiempo_segundos
FROM dbo.simulacion_participante sp
JOIN dbo.simulacion s   ON sp.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci    ON s.id_circuito = ci.id_circuito
JOIN dbo.carro ca       ON sp.id_carro = ca.id_carro
JOIN dbo.equipo e       ON sp.id_equipo = e.id_equipo;
GO

-- ============================================================
-- VIEW 2: Comparación del mismo carro en simulaciones distintas
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_carro_historial
AS
SELECT
    -- Carro
    ca.id_carro,
    ca.nombre AS carro,
    sp.id_equipo,
    e.nombre AS equipo,

    -- Simulación / circuito
    s.id_simulacion,
    s.fecha_hora AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre AS circuito,

    -- Setup y resultado
    sp.setup_id,
    sp.tiempo_segundos,
    sp.vrecta,
    sp.vcurva,
    sp.penalizacion,
    sp.posicion
FROM dbo.simulacion_participante sp
JOIN dbo.simulacion s   ON sp.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci    ON s.id_circuito = ci.id_circuito
JOIN dbo.carro ca       ON sp.id_carro = ca.id_carro
JOIN dbo.equipo e       ON sp.id_equipo = e.id_equipo;
GO

-- ============================================================
-- VIEW 3: Relación Tiempo vs P/A/M
-- ============================================================
CREATE OR ALTER VIEW dbo.v_grafana_tiempo_vs_pam
AS
SELECT
    -- Simulación / circuito
    s.id_simulacion,
    s.fecha_hora AS fecha_simulacion,
    ci.id_circuito,
    ci.nombre AS circuito,

    -- Carro / equipo
    sp.id_carro,
    ca.nombre AS carro,
    sp.id_equipo,
    e.nombre AS equipo,

    -- Setup y resultado
    sp.setup_id,
    sp.tiempo_segundos,
    sp.vrecta,
    sp.vcurva,
    sp.penalizacion,

    -- P/A/M ya calculados y guardados en simulacion_participante
    sp.total_p AS p_total,
    sp.total_a AS a_total,
    sp.total_m AS m_total
FROM dbo.simulacion_participante sp
JOIN dbo.simulacion s   ON sp.id_simulacion = s.id_simulacion
JOIN dbo.circuito ci    ON s.id_circuito = ci.id_circuito
JOIN dbo.carro ca       ON sp.id_carro = ca.id_carro
JOIN dbo.equipo e       ON sp.id_equipo = e.id_equipo;
GO