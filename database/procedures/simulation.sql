USE f1_garage_tec;
GO

/* =========================================================
   0) Drop seguro de objetos de simulación (solo los nuevos)
   ========================================================= */
IF OBJECT_ID('dbo.simulacion_participante_pieza', 'U') IS NOT NULL DROP TABLE dbo.simulacion_participante_pieza;
IF OBJECT_ID('dbo.simulacion_participante', 'U') IS NOT NULL DROP TABLE dbo.simulacion_participante;
IF OBJECT_ID('dbo.parametro_sistema', 'U') IS NOT NULL DROP TABLE dbo.parametro_sistema;
GO

IF OBJECT_ID('dbo.sp_ejecutar_simulacion', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_ejecutar_simulacion;
IF OBJECT_ID('dbo.sp_listar_carros_elegibles', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_listar_carros_elegibles;
GO

/* =========================================================
   1) Parámetros globales del sistema (dc)
   ========================================================= */

CREATE TABLE dbo.parametro_sistema (
  nombre NVARCHAR(50) NOT NULL,
  valor  DECIMAL(12,6) NOT NULL,
  CONSTRAINT pk_parametro_sistema PRIMARY KEY (nombre)
);
GO

INSERT INTO dbo.parametro_sistema(nombre, valor)
VALUES ('dc', 0.150);
GO



/* =========================================================
   3) Asegurar 1 setup actual por carro (evita múltiples es_actual=1)
   ========================================================= */

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ux_car_setup_actual_por_carro' AND object_id = OBJECT_ID('dbo.car_setup'))
    DROP INDEX ux_car_setup_actual_por_carro ON dbo.car_setup;
GO

CREATE UNIQUE INDEX ux_car_setup_actual_por_carro
ON dbo.car_setup(car_id)
WHERE es_actual = 1;
GO

/* =========================================================
   4) Snapshot de resultados por carro (para Grafana / histórico)
   - 1 fila por (simulación, carro)
   ========================================================= */

USE f1_garage_tec;
GO

CREATE TABLE dbo.simulacion_participante (
  id_simulacion   INT NOT NULL,
  id_carro        INT NOT NULL,
  id_equipo       INT NOT NULL,
  id_conductor    INT NOT NULL,
  setup_id        INT NOT NULL,

  total_p         INT NOT NULL,
  total_a         INT NOT NULL,
  total_m         INT NOT NULL,
  habilidad_h     INT NOT NULL,

  vrecta          DECIMAL(10,3) NOT NULL,
  vcurva          DECIMAL(10,3) NOT NULL,
  penalizacion    DECIMAL(12,3) NOT NULL,
  tiempo_segundos DECIMAL(12,3) NOT NULL,

  posicion        INT NULL,

  CONSTRAINT pk_sim_part PRIMARY KEY (id_simulacion, id_carro),
  CONSTRAINT fk_sp_sim FOREIGN KEY (id_simulacion) REFERENCES dbo.simulacion(id_simulacion) ON DELETE CASCADE,
  CONSTRAINT fk_sp_car FOREIGN KEY (id_carro) REFERENCES dbo.carro(id_carro),
  CONSTRAINT fk_sp_eq  FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
  CONSTRAINT fk_sp_con FOREIGN KEY (id_conductor) REFERENCES dbo.conductor(id_conductor),
  CONSTRAINT fk_sp_setup FOREIGN KEY (setup_id) REFERENCES dbo.car_setup(setup_id),

  CONSTRAINT ck_sp_totales_nonneg CHECK (total_p >= 0 AND total_a >= 0 AND total_m >= 0),
  CONSTRAINT ck_sp_h CHECK (habilidad_h BETWEEN 0 AND 100),
  CONSTRAINT ck_sp_tiempo CHECK (tiempo_segundos >= 0),
  CONSTRAINT ck_sp_posicion CHECK (posicion IS NULL OR posicion > 0)
);
GO

CREATE INDEX ix_sp_sim_tiempo ON dbo.simulacion_participante(id_simulacion, tiempo_segundos);
CREATE INDEX ix_sp_equipo_sim ON dbo.simulacion_participante(id_equipo, id_simulacion);
GO



/* =========================================================
   5) Snapshot de setup por categoría (congelado)
   - 5 filas por (simulación, carro)
   ========================================================= */

   CREATE TABLE dbo.simulacion_participante_pieza (
  id_simulacion INT NOT NULL,
  id_carro      INT NOT NULL,
  category_id   INT NOT NULL,
  part_id       INT NOT NULL,

  part_nombre   NVARCHAR(120) NOT NULL,
  p             TINYINT NOT NULL,
  a             TINYINT NOT NULL,
  m             TINYINT NOT NULL,

  CONSTRAINT pk_spp PRIMARY KEY (id_simulacion, id_carro, category_id),

  CONSTRAINT fk_spp_participante
    FOREIGN KEY (id_simulacion, id_carro)
    REFERENCES dbo.simulacion_participante(id_simulacion, id_carro)
    ON DELETE CASCADE,

  CONSTRAINT fk_spp_cat FOREIGN KEY (category_id) REFERENCES dbo.part_category(category_id),
  CONSTRAINT fk_spp_pieza FOREIGN KEY (part_id) REFERENCES dbo.pieza(id_pieza),

  CONSTRAINT ck_spp_p CHECK (p BETWEEN 0 AND 9),
  CONSTRAINT ck_spp_a CHECK (a BETWEEN 0 AND 9),
  CONSTRAINT ck_spp_m CHECK (m BETWEEN 0 AND 9)
);
GO

/* =========================================================
   6) Stored Procedure principal: ejecutar simulación
   - Valida: circuito, dc, Drectas >= 0, carros finalizados,
             setup actual completo (5 categorías), conductor asignado.
   - Inserta: simulacion, snapshot participantes, snapshot piezas,
             calcula ranking y actualiza posicion.
   - Todo en transacción.
   ========================================================= */

USE f1_garage_tec;
GO

USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ejecutar_simulacion
  @id_circuito INT,
  @id_usuario  INT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRAN;

    /* ===== Validar circuito ===== */
    DECLARE @D DECIMAL(10,3), @C INT;
    SELECT @D = distancia_d, @C = curvas_c
    FROM dbo.circuito
    WHERE id_circuito = @id_circuito;

    IF @D IS NULL
    BEGIN
      RAISERROR('Circuito no existe.', 16, 1);
      ROLLBACK; RETURN;
    END;

    /* ===== dc global ===== */
    DECLARE @dc DECIMAL(12,6);
    SELECT @dc = valor
    FROM dbo.parametro_sistema
    WHERE nombre = 'dc';

    IF @dc IS NULL
    BEGIN
      RAISERROR('Falta parametro global dc en parametro_sistema.', 16, 1);
      ROLLBACK; RETURN;
    END;

    DECLARE @Dcurvas  DECIMAL(18,6) = CAST(@C AS DECIMAL(18,6)) * @dc;
    DECLARE @Drectas  DECIMAL(18,6) = CAST(@D AS DECIMAL(18,6)) - @Dcurvas;

    IF @Drectas < 0
    BEGIN
      RAISERROR('Drectas < 0: revise dc o el circuito (C*dc no puede exceder D).', 16, 1);
      ROLLBACK; RETURN;
    END;

    /* ===== Crear simulación ===== */
    INSERT INTO dbo.simulacion(id_circuito, id_usuario)
    VALUES (@id_circuito, @id_usuario);

    DECLARE @id_simulacion INT = SCOPE_IDENTITY();

    /* ===== Carros elegibles =====
       - finalizado=1
       - id_conductor NOT NULL (carro)
       - setup actual es_actual=1
       - setup tiene exactamente 5 categorías
    */
    ;WITH setup_actual AS (
      SELECT cs.setup_id, cs.car_id
      FROM dbo.car_setup cs
      WHERE cs.es_actual = 1
    ),
    setup_completo AS (
      SELECT sa.setup_id, sa.car_id
      FROM setup_actual sa
      JOIN dbo.car_setup_pieza csp ON csp.setup_id = sa.setup_id
      GROUP BY sa.setup_id, sa.car_id
      HAVING COUNT(*) = 5
    ),
    elegibles AS (
      SELECT
        c.id_carro,
        c.id_equipo,
        sc.setup_id,
        c.id_conductor,
        con.habilidad_h
      FROM dbo.carro c
      JOIN setup_completo sc ON sc.car_id = c.id_carro
      JOIN dbo.conductor con ON con.id_conductor = c.id_conductor
      WHERE c.finalizado = 1
        AND c.id_conductor IS NOT NULL
        AND c.id_equipo <> 0
    ),
    totales AS (
      SELECT
        e.id_carro,
        e.id_equipo,
        e.setup_id,
        e.id_conductor,
        e.habilidad_h,
        SUM(CAST(pz.p AS INT)) AS total_p,
        SUM(CAST(pz.a AS INT)) AS total_a,
        SUM(CAST(pz.m AS INT)) AS total_m
      FROM elegibles e
      JOIN dbo.car_setup_pieza csp ON csp.setup_id = e.setup_id
      JOIN dbo.pieza pz ON pz.id_pieza = csp.part_id
      GROUP BY e.id_carro, e.id_equipo, e.setup_id, e.id_conductor, e.habilidad_h
    )
    INSERT INTO dbo.simulacion_participante (
      id_simulacion, id_carro, id_equipo, id_conductor, setup_id,
      total_p, total_a, total_m, habilidad_h,
      vrecta, vcurva, penalizacion, tiempo_segundos,
      posicion
    )
    SELECT
      @id_simulacion,
      t.id_carro,
      t.id_equipo,
      t.id_conductor,
      t.setup_id,
      t.total_p,
      t.total_a,
      t.total_m,
      t.habilidad_h,

      /* Vrecta = 200 + 3*P + 0.2*H - 1*A */
      CAST(200 + (3.0 * t.total_p) + (0.2 * t.habilidad_h) - (1.0 * t.total_a) AS DECIMAL(10,3)),

      /* Vcurva = 90 + 2*A + 2*M + 0.2*H */
      CAST(90 + (2.0 * t.total_a) + (2.0 * t.total_m) + (0.2 * t.habilidad_h) AS DECIMAL(10,3)),

      /* Penalizacion = C*40 / (1 + H/100) */
      CAST(
        (CAST(@C AS DECIMAL(18,6)) * 40.0) /
        (1.0 + (CAST(t.habilidad_h AS DECIMAL(18,6)) / 100.0))
      AS DECIMAL(12,3)),

      /* TiempoSeg = (Drectas/Vrecta + Dcurvas/Vcurva)*3600 + Penalizacion */
      CAST(
        (
          (
            (CAST(@Drectas AS DECIMAL(18,6)) /
              NULLIF((200 + (3.0 * t.total_p) + (0.2 * t.habilidad_h) - (1.0 * t.total_a)), 0.0))
            +
            (CAST(@Dcurvas AS DECIMAL(18,6)) /
              NULLIF((90 + (2.0 * t.total_a) + (2.0 * t.total_m) + (0.2 * t.habilidad_h)), 0.0))
          ) * 3600.0
        )
        +
        (
          (CAST(@C AS DECIMAL(18,6)) * 40.0) /
          (1.0 + (CAST(t.habilidad_h AS DECIMAL(18,6)) / 100.0))
        )
      AS DECIMAL(12,3)),

      NULL
    FROM totales t;

    IF NOT EXISTS (SELECT 1 FROM dbo.simulacion_participante WHERE id_simulacion = @id_simulacion)
    BEGIN
      RAISERROR('No hay carros elegibles: revise finalizado, setup completo y conductor asignado.', 16, 1);
      ROLLBACK; RETURN;
    END;

    /* ===== Snapshot piezas (5 filas por carro) ===== */
    INSERT INTO dbo.simulacion_participante_pieza (
      id_simulacion, id_carro, category_id, part_id,
      part_nombre, p, a, m
    )
    SELECT
      sp.id_simulacion,
      sp.id_carro,
      csp.category_id,
      pz.id_pieza,
      pz.nombre,
      pz.p, pz.a, pz.m
    FROM dbo.simulacion_participante sp
    JOIN dbo.car_setup_pieza csp ON csp.setup_id = sp.setup_id
    JOIN dbo.pieza pz ON pz.id_pieza = csp.part_id
    WHERE sp.id_simulacion = @id_simulacion;

    /* ===== Ranking ===== */
    ;WITH r AS (
      SELECT
        id_simulacion,
        id_carro,
        ROW_NUMBER() OVER (PARTITION BY id_simulacion ORDER BY tiempo_segundos ASC) AS pos
      FROM dbo.simulacion_participante
      WHERE id_simulacion = @id_simulacion
    )
    UPDATE sp
    SET sp.posicion = r.pos
    FROM dbo.simulacion_participante sp
    JOIN r ON r.id_simulacion = sp.id_simulacion AND r.id_carro = sp.id_carro;

    COMMIT;

    /* =========================================================
       SALIDA "LISTA PARA UI"
       - Nombres compatibles con tu RaceResults.jsx
       ========================================================= */
    ;WITH base AS (
      SELECT
        sp.id_simulacion,
        sp.id_carro,
        sp.id_equipo,
        e.nombre AS team,
        sp.id_conductor,
        co.nombre AS driver,
        sp.setup_id,

        sp.total_p AS P,
        sp.total_a AS A,
        sp.total_m AS M,
        sp.habilidad_h AS H,

        sp.vrecta AS Vrecta,
        sp.vcurva AS Vcurva,

        sp.penalizacion AS penalty,
        sp.tiempo_segundos AS timeSeconds,
        sp.posicion AS position
      FROM dbo.simulacion_participante sp
      JOIN dbo.equipo e     ON e.id_equipo = sp.id_equipo
      JOIN dbo.conductor co ON co.id_conductor = sp.id_conductor
      WHERE sp.id_simulacion = @id_simulacion
    ),
    winner AS (
      SELECT MIN(timeSeconds) AS bestTime
      FROM base
    )
    SELECT
      b.id_simulacion,
      b.id_carro,
      b.id_equipo,
      b.team,
      b.id_conductor,
      b.driver,
      b.setup_id,

      b.P, b.A, b.M, b.H,
      b.Vrecta, b.Vcurva,
      b.penalty,
      b.timeSeconds,

      CAST(b.timeSeconds - w.bestTime AS DECIMAL(12,3)) AS diff,
      b.position
    FROM base b
    CROSS JOIN winner w
    ORDER BY b.position ASC;

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@msg, 16, 1);
    RETURN;
  END CATCH
END;
GO


CREATE OR ALTER PROCEDURE dbo.sp_listar_carros_elegibles
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH setup_actual AS (
    SELECT cs.car_id AS id_carro, cs.setup_id
    FROM dbo.car_setup cs
    WHERE cs.es_actual = 1
  ),
  setup_stats AS (
    SELECT
      sa.id_carro,
      sa.setup_id,
      COUNT(*) AS categorias_count,
      SUM(CAST(pz.p AS INT)) AS total_p,
      SUM(CAST(pz.a AS INT)) AS total_a,
      SUM(CAST(pz.m AS INT)) AS total_m
    FROM setup_actual sa
    JOIN dbo.car_setup_pieza csp ON csp.setup_id = sa.setup_id
    JOIN dbo.pieza pz ON pz.id_pieza = csp.part_id
    GROUP BY sa.id_carro, sa.setup_id
  )
  SELECT
    c.id_carro,
    c.nombre,
    c.id_equipo,
    e.nombre AS equipo_nombre,

    ss.setup_id,
    ss.total_p AS P,
    ss.total_a AS A,
    ss.total_m AS M,

    c.id_conductor,
    d.nombre AS conductor_nombre,
    d.habilidad_h

  FROM dbo.carro c
  JOIN dbo.equipo e ON e.id_equipo = c.id_equipo
  JOIN setup_stats ss ON ss.id_carro = c.id_carro
  JOIN dbo.conductor d ON d.id_conductor = c.id_conductor

  WHERE
    c.finalizado = 1
    AND c.id_conductor IS NOT NULL
    AND ss.categorias_count = 5
    AND c.id_equipo <> 0

  ORDER BY e.nombre, c.nombre;
END;
GO


