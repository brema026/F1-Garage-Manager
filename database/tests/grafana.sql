USE f1_garage_tec;
GO

/* =====================================================
   EQUIPOS (solo si no existen)
   ===================================================== */
IF NOT EXISTS (SELECT 1 FROM equipo WHERE nombre = 'Red Comet')
    INSERT INTO equipo (nombre) VALUES ('Red Comet');

IF NOT EXISTS (SELECT 1 FROM equipo WHERE nombre = 'Blue Falcon')
    INSERT INTO equipo (nombre) VALUES ('Blue Falcon');

IF NOT EXISTS (SELECT 1 FROM equipo WHERE nombre = 'Green Viper')
    INSERT INTO equipo (nombre) VALUES ('Green Viper');
GO

/* =====================================================
   CARROS (crear hasta tener 15)
   ===================================================== */
DECLARE @carCount INT = (SELECT COUNT(*) FROM carro);

IF @carCount < 15
BEGIN
    INSERT INTO carro (id_equipo, nombre, finalizado)
    SELECT TOP (15 - @carCount)
        e.id_equipo,
        CONCAT(LEFT(e.nombre,2), '-', ROW_NUMBER() OVER (PARTITION BY e.id_equipo ORDER BY (SELECT NULL))),
        1
    FROM equipo e
    CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) x;
END
GO

/* =====================================================
   CIRCUITOS (3 fijos, si no existen)
   ===================================================== */
IF NOT EXISTS (SELECT 1 FROM circuito WHERE nombre = 'Silver Coast')
    INSERT INTO circuito (nombre, distancia_d, curvas_c)
    VALUES ('Silver Coast', 305.5, 18);

IF NOT EXISTS (SELECT 1 FROM circuito WHERE nombre = 'Desert Ring')
    INSERT INTO circuito (nombre, distancia_d, curvas_c)
    VALUES ('Desert Ring', 280.2, 14);

IF NOT EXISTS (SELECT 1 FROM circuito WHERE nombre = 'Mountain Loop')
    INSERT INTO circuito (nombre, distancia_d, curvas_c)
    VALUES ('Mountain Loop', 320.7, 22);
GO

/* =====================================================
   SIMULACIONES (exactamente 3)
   ===================================================== */
DECLARE @simCount INT = (SELECT COUNT(*) FROM simulacion);

IF @simCount < 3
BEGIN
    INSERT INTO simulacion (id_circuito)
    SELECT TOP (3 - @simCount) id_circuito
    FROM circuito
    ORDER BY id_circuito;
END
GO

/* =====================================================
   SETUPS
   - eliminar actuales
   - crear 3 setups por carro
   - solo el último queda como actual
   ===================================================== */
UPDATE car_setup SET es_actual = 0;
GO

DECLARE @carId INT;

DECLARE car_cursor CURSOR FOR
SELECT id_carro FROM carro;

OPEN car_cursor;
FETCH NEXT FROM car_cursor INTO @carId;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- crear 3 setups
    INSERT INTO car_setup (car_id, es_actual) VALUES (@carId, 0);
    INSERT INTO car_setup (car_id, es_actual) VALUES (@carId, 0);
    INSERT INTO car_setup (car_id, es_actual) VALUES (@carId, 1);

    FETCH NEXT FROM car_cursor INTO @carId;
END

CLOSE car_cursor;
DEALLOCATE car_cursor;
GO

/* =====================================================
   RESULTADOS (15 carros × 3 simulaciones)
   ===================================================== */
-- limpiar resultados previos (solo para dummy)
DELETE FROM resultado_simulacion;
GO

DECLARE @simId INT;

DECLARE sim_cursor CURSOR FOR
SELECT id_simulacion FROM simulacion ORDER BY id_simulacion;

OPEN sim_cursor;
FETCH NEXT FROM sim_cursor INTO @simId;

WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO resultado_simulacion
    (id_simulacion, id_carro, setup_id, posicion, vrecta, vcurva, penalizacion, tiempo_segundos)
    SELECT
        @simId,
        c.id_carro,
        s.setup_id,
        ROW_NUMBER() OVER (ORDER BY c.id_carro),
        300 + c.id_carro + @simId * 2,
        140 + (c.id_carro % 10),
        25 + (@simId * 2),
        95 - (@simId * 1.5) + (c.id_carro * 0.2)
    FROM carro c
    JOIN car_setup s ON s.car_id = c.id_carro
    WHERE s.setup_id IN (
        SELECT TOP 1 setup_id
        FROM car_setup
        WHERE car_id = c.id_carro
        ORDER BY setup_id DESC
    );

    FETCH NEXT FROM sim_cursor INTO @simId;
END

CLOSE sim_cursor;
DEALLOCATE sim_cursor;
GO
