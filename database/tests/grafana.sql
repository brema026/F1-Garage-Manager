-- =====================================================================
-- Archivo: dummy_data_grafana.sql
-- Base de datos: f1_garage_tec
-- Descripción: Datos dummy determinísticos para probar:
--              1) Ranking por simulación/circuito
--              2) Mismo carro en simulaciones distintas (setup vs tiempo)
--              3) Tiempo vs P/A/M (piezas instaladas por setup)
--
-- Requisito especial (para Panel 2):
--  - Cada carro cambia MUCHO entre simulaciones: en unas sale muy bueno,
--    en otras muy malo, y en otras regular.
--  - En cada simulación hay mezcla equilibrada de carros: top, mid, bottom.
--
-- Características:
--  - IDs fijos (enteros) para equipo, circuito, carro, simulación.
--  - 3 circuitos, 3 simulaciones por circuito (9 simulaciones totales).
--  - 15 carros participantes en cada simulación (135 resultados).
--  - 3 setups por carro y por simulación (45 setups por simulación, 405 setups).
--  - Cada setup tiene 1 pieza por categoría (5 categorías) -> P/A/M no quedan en 0.
--  - Script idempotente: borra SOLO data dummy en rangos de ID usados aquí.
-- =====================================================================
USE f1_garage_tec;
GO

SET NOCOUNT ON;
GO

/* =====================================================
   0) VALIDACIONES MÍNIMAS (categorías existentes)
   ===================================================== */
IF (SELECT COUNT(*) FROM dbo.part_category) < 5
BEGIN
    RAISERROR('Faltan categorías en part_category. Ejecuta el schema primero.', 16, 1);
    RETURN;
END
GO

/* =====================================================
   1) LIMPIEZA DUMMY (rangos usados)
   ===================================================== */
DELETE rs
FROM dbo.resultado_simulacion rs
WHERE rs.id_simulacion BETWEEN 101 AND 109
   OR rs.id_simulacion BETWEEN 201 AND 209
   OR rs.id_simulacion BETWEEN 301 AND 309;
GO

DELETE csp
FROM dbo.car_setup_pieza csp
WHERE csp.setup_id IN (
    SELECT setup_id
    FROM dbo.car_setup
    WHERE setup_id BETWEEN 101000 AND 303999
);
GO

DELETE cs
FROM dbo.car_setup cs
WHERE cs.setup_id BETWEEN 101000 AND 303999;
GO

DELETE s
FROM dbo.simulacion s
WHERE s.id_simulacion IN (101,102,103,201,202,203,301,302,303);
GO

DELETE c
FROM dbo.carro c
WHERE c.id_carro BETWEEN 101 AND 115;
GO

DELETE ci
FROM dbo.circuito ci
WHERE ci.id_circuito IN (101, 102, 103);
GO

DELETE e
FROM dbo.equipo e
WHERE e.id_equipo IN (101, 102, 103);
GO

DELETE ps
FROM dbo.part_stock ps
WHERE ps.part_id BETWEEN 1001 AND 1999;
GO

DELETE pz
FROM dbo.pieza pz
WHERE pz.id_pieza BETWEEN 1001 AND 1999;
GO

/* =====================================================
   2) EQUIPOS (IDs fijos)
   ===================================================== */
SET IDENTITY_INSERT dbo.equipo ON;

INSERT INTO dbo.equipo (id_equipo, nombre)
VALUES
(101, 'Red Comet'),
(102, 'Blue Falcon'),
(103, 'Green Viper');

SET IDENTITY_INSERT dbo.equipo OFF;
GO

/* =====================================================
   3) CIRCUITOS (IDs fijos)
   ===================================================== */
SET IDENTITY_INSERT dbo.circuito ON;

INSERT INTO dbo.circuito (id_circuito, nombre, distancia_d, curvas_c)
VALUES
(101, 'Silver Coast', 305.500, 18),
(102, 'Desert Ring',  280.200, 14),
(103, 'Mountain Loop',320.700, 22);

SET IDENTITY_INSERT dbo.circuito OFF;
GO

/* =====================================================
   4) CARROS (15, IDs fijos 101..115)
   ===================================================== */
SET IDENTITY_INSERT dbo.carro ON;

INSERT INTO dbo.carro (id_carro, id_equipo, nombre, finalizado)
VALUES
(101, 101, 'RC-01', 1),
(102, 101, 'RC-02', 1),
(103, 101, 'RC-03', 1),
(104, 101, 'RC-04', 1),
(105, 101, 'RC-05', 1),

(106, 102, 'BF-01', 1),
(107, 102, 'BF-02', 1),
(108, 102, 'BF-03', 1),
(109, 102, 'BF-04', 1),
(110, 102, 'BF-05', 1),

(111, 103, 'GV-01', 1),
(112, 103, 'GV-02', 1),
(113, 103, 'GV-03', 1),
(114, 103, 'GV-04', 1),
(115, 103, 'GV-05', 1);

SET IDENTITY_INSERT dbo.carro OFF;
GO

/* =====================================================
   5) PIEZAS DUMMY (IDs fijos 1001..1025)
   - 5 piezas por categoría (25 total)
   ===================================================== */
SET IDENTITY_INSERT dbo.pieza ON;

-- Cat 1
INSERT INTO dbo.pieza (id_pieza, nombre, precio, p, a, m, categoria_id) VALUES
(1001, 'PU-A1', 12000, 9, 2, 3, 1),
(1002, 'PU-A2', 11000, 8, 2, 4, 1),
(1003, 'PU-B1',  9500, 7, 1, 5, 1),
(1004, 'PU-B2',  8800, 6, 1, 6, 1),
(1005, 'PU-C1',  8000, 5, 1, 7, 1);

-- Cat 2
INSERT INTO dbo.pieza (id_pieza, nombre, precio, p, a, m, categoria_id) VALUES
(1006, 'AERO-A1', 9000, 2, 9, 3, 2),
(1007, 'AERO-A2', 8500, 2, 8, 4, 2),
(1008, 'AERO-B1', 7800, 1, 7, 5, 2),
(1009, 'AERO-B2', 7200, 1, 6, 6, 2),
(1010, 'AERO-C1', 6500, 1, 5, 7, 2);

-- Cat 3
INSERT INTO dbo.pieza (id_pieza, nombre, precio, p, a, m, categoria_id) VALUES
(1011, 'TIRE-A1', 5000, 3, 3, 9, 3),
(1012, 'TIRE-A2', 4800, 3, 3, 8, 3),
(1013, 'TIRE-B1', 4500, 2, 2, 7, 3),
(1014, 'TIRE-B2', 4200, 2, 2, 6, 3),
(1015, 'TIRE-C1', 3900, 1, 1, 5, 3);

-- Cat 4
INSERT INTO dbo.pieza (id_pieza, nombre, precio, p, a, m, categoria_id) VALUES
(1016, 'SUS-A1', 7000, 3, 7, 4, 4),
(1017, 'SUS-A2', 6700, 3, 6, 4, 4),
(1018, 'SUS-B1', 6300, 2, 5, 5, 4),
(1019, 'SUS-B2', 5900, 2, 4, 5, 4),
(1020, 'SUS-C1', 5500, 1, 3, 6, 4);

-- Cat 5
INSERT INTO dbo.pieza (id_pieza, nombre, precio, p, a, m, categoria_id) VALUES
(1021, 'GB-A1', 8000, 6, 2, 4, 5),
(1022, 'GB-A2', 7600, 5, 2, 4, 5),
(1023, 'GB-B1', 7200, 4, 2, 5, 5),
(1024, 'GB-B2', 6800, 3, 1, 6, 5),
(1025, 'GB-C1', 6400, 2, 1, 7, 5);

SET IDENTITY_INSERT dbo.pieza OFF;
GO

INSERT INTO dbo.part_stock (part_id, stock_disponible)
SELECT id_pieza, 50
FROM dbo.pieza
WHERE id_pieza BETWEEN 1001 AND 1025;
GO

/* =====================================================
   6) SIMULACIONES (9 total, IDs fijos)
   - Fechas distintas para que Panel 2 se vea bien sin trucos
   ===================================================== */
SET IDENTITY_INSERT dbo.simulacion ON;

DECLARE @base DATETIME2 = DATEADD(DAY, -2, SYSUTCDATETIME());

INSERT INTO dbo.simulacion (id_simulacion, id_circuito, fecha_hora, id_usuario)
VALUES
-- Silver Coast
(101, 101, DATEADD(HOUR,  0, @base), NULL),
(102, 101, DATEADD(HOUR,  6, @base), NULL),
(103, 101, DATEADD(HOUR, 12, @base), NULL),

-- Desert Ring
(201, 102, DATEADD(HOUR,  1, @base), NULL),
(202, 102, DATEADD(HOUR,  7, @base), NULL),
(203, 102, DATEADD(HOUR, 13, @base), NULL),

-- Mountain Loop
(301, 103, DATEADD(HOUR,  2, @base), NULL),
(302, 103, DATEADD(HOUR,  8, @base), NULL),
(303, 103, DATEADD(HOUR, 14, @base), NULL);

SET IDENTITY_INSERT dbo.simulacion OFF;
GO

/* =====================================================
   7) SETUPS
   - 3 setups por carro por simulación
   - setup_id determinístico:
       setup_id = (id_simulacion * 1000) + (id_carro - 100) * 10 + n
   ===================================================== */
SET IDENTITY_INSERT dbo.car_setup ON;

;WITH Cars AS (
    SELECT id_carro FROM dbo.carro WHERE id_carro BETWEEN 101 AND 115
),
Sims AS (
    SELECT id_simulacion, fecha_hora
    FROM dbo.simulacion
    WHERE id_simulacion IN (101,102,103,201,202,203,301,302,303)
),
N AS (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3)
INSERT INTO dbo.car_setup (setup_id, car_id, fecha_instalacion, es_actual)
SELECT
    (s.id_simulacion * 1000) + ((c.id_carro - 100) * 10) + n.n AS setup_id,
    c.id_carro,
    DATEADD(MINUTE, (c.id_carro - 100) * 2 + (n.n * 3), s.fecha_hora) AS fecha_instalacion,
    CASE WHEN n.n = 3 THEN 1 ELSE 0 END
FROM Cars c
CROSS JOIN Sims s
CROSS JOIN N n;

SET IDENTITY_INSERT dbo.car_setup OFF;
GO

/* =====================================================
   8) PIEZAS POR SETUP
   - 1 pieza por categoría (5 categorías)
   - Mezcla fuerte según setup_id para que P/A/M cambien bastante
   ===================================================== */
;WITH Setups AS (
    SELECT setup_id
    FROM dbo.car_setup
    WHERE setup_id BETWEEN 101000 AND 303999
),
Cats AS (
    SELECT category_id FROM dbo.part_category WHERE category_id BETWEEN 1 AND 5
),
Pick AS (
    SELECT
        s.setup_id,
        c.category_id,
        -- índice 0..4 que cambia fuerte con setup_id
        ((s.setup_id * 7) + (c.category_id * 11)) % 5 AS k
    FROM Setups s
    CROSS JOIN Cats c
)
INSERT INTO dbo.car_setup_pieza (setup_id, category_id, part_id)
SELECT
    p.setup_id,
    p.category_id,
    (CASE p.category_id
        WHEN 1 THEN 1001
        WHEN 2 THEN 1006
        WHEN 3 THEN 1011
        WHEN 4 THEN 1016
        WHEN 5 THEN 1021
     END) + p.k
FROM Pick p;
GO

/* =====================================================
   9) RESULTADOS (135)
   Requisito: variación MUY fuerte por carro entre simulaciones.
   Estrategia:
   - En cada simulación, asignamos a cada carro un "tier" (TOP/MID/BOT)
     basado en una permutación determinística que cambia con id_simulacion.
   - Tier afecta el tiempo:
       TOP  -> mucho más rápido
       MID  -> regular
       BOT  -> mucho más lento
   - Así, el mismo carro puede ser TOP en una simulación y BOT en otra.
   ===================================================== */
DELETE FROM dbo.resultado_simulacion
WHERE id_simulacion IN (101,102,103,201,202,203,301,302,303);
GO

;WITH Base AS (
    SELECT
        s.id_simulacion,
        s.id_circuito,
        s.fecha_hora,
        c.id_carro,
        (s.id_simulacion * 1000) + ((c.id_carro - 100) * 10) + 3 AS setup_id
    FROM dbo.simulacion s
    CROSS JOIN (SELECT id_carro FROM dbo.carro WHERE id_carro BETWEEN 101 AND 115) c
    WHERE s.id_simulacion IN (101,102,103,201,202,203,301,302,303)
),
Pam AS (
    SELECT
        b.id_simulacion,
        b.id_circuito,
        b.fecha_hora,
        b.id_carro,
        b.setup_id,
        SUM(CAST(pz.p AS INT)) AS p_total,
        SUM(CAST(pz.a AS INT)) AS a_total,
        SUM(CAST(pz.m AS INT)) AS m_total
    FROM Base b
    JOIN dbo.car_setup_pieza csp ON csp.setup_id = b.setup_id
    JOIN dbo.pieza pz ON pz.id_pieza = csp.part_id
    GROUP BY b.id_simulacion, b.id_circuito, b.fecha_hora, b.id_carro, b.setup_id
),
Tiered AS (
    SELECT
        p.*,
        -- score 0..14 que "baraja" carros distinto por simulación
        (((p.id_carro - 101) * 7) + (p.id_simulacion * 3)) % 15 AS score15,
        CASE
            WHEN ((((p.id_carro - 101) * 7) + (p.id_simulacion * 3)) % 15) BETWEEN 0 AND 4 THEN 0  -- TOP
            WHEN ((((p.id_carro - 101) * 7) + (p.id_simulacion * 3)) % 15) BETWEEN 5 AND 9 THEN 1  -- MID
            ELSE 2 -- BOT
        END AS tier
    FROM Pam p
),
Calc AS (
    SELECT
        t.id_simulacion,
        t.id_carro,
        t.setup_id,

        -- Velocidades
        CAST(
            290
            + (t.p_total * 0.8) + (t.a_total * 0.6) - (t.m_total * 0.4)
            + CASE t.id_circuito WHEN 101 THEN 8 WHEN 102 THEN 10 ELSE 6 END
            + CASE t.tier WHEN 0 THEN 18 WHEN 1 THEN 0 ELSE -10 END
            AS DECIMAL(10,3)
        ) AS vrecta,

        CAST(
            125
            + (t.a_total * 0.9) + (t.m_total * 0.7) - (t.p_total * 0.2)
            + CASE t.id_circuito WHEN 101 THEN 4 WHEN 102 THEN 2 ELSE 6 END
            + CASE t.tier WHEN 0 THEN 10 WHEN 1 THEN 0 ELSE -6 END
            AS DECIMAL(10,3)
        ) AS vcurva,

        -- Penalización
        CAST(
            8
            + CASE t.id_circuito WHEN 101 THEN 5 WHEN 102 THEN 3 ELSE 7 END
            + (t.m_total * 0.20)
            + CASE t.tier WHEN 0 THEN 0 WHEN 1 THEN 2 ELSE 6 END
            + (t.score15 % 3) * 0.4
            AS DECIMAL(12,3)
        ) AS penalizacion,

        -- Tiempo: base por circuito + tier (MUY fuerte) + PAM
        CAST(
            CASE t.id_circuito
                WHEN 101 THEN 110.0
                WHEN 102 THEN 108.0
                ELSE 112.0
            END
            + CASE t.tier
                WHEN 0 THEN -18.0   -- TOP muy rápido
                WHEN 1 THEN  0.0    -- MID
                ELSE  22.0          -- BOT muy lento
            END
            + (12 - (t.p_total * 0.10))
            + (10 - (t.a_total * 0.08))
            + (t.m_total * 0.06)
            + ((t.score15 - 7) * 0.25)
            AS DECIMAL(12,3)
        ) AS tiempo_segundos
    FROM Tiered t
),
Ranked AS (
    SELECT
        id_simulacion,
        id_carro,
        setup_id,
        vrecta,
        vcurva,
        penalizacion,
        tiempo_segundos,
        ROW_NUMBER() OVER (PARTITION BY id_simulacion ORDER BY tiempo_segundos ASC) AS posicion
    FROM Calc
)
INSERT INTO dbo.resultado_simulacion
(id_simulacion, id_carro, setup_id, posicion, vrecta, vcurva, penalizacion, tiempo_segundos)
SELECT
    id_simulacion,
    id_carro,
    setup_id,
    posicion,
    vrecta,
    vcurva,
    penalizacion,
    tiempo_segundos
FROM Ranked
ORDER BY id_simulacion, posicion;
GO

/* =====================================================
   10) VERIFICACIÓN RÁPIDA (opcional)
   - Un mismo carro debe variar bastante entre simulaciones.
   ===================================================== */
-- SELECT id_carro, carro, id_simulacion, circuito, tiempo_segundos, posicion
-- FROM dbo.v_grafana_carro_historial
-- WHERE id_carro = 101
-- ORDER BY id_simulacion;

GO
