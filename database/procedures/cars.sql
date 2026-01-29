-- =====================================================================
-- Archivo: cars.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de carros (creación, límites)
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Crear un nuevo carro para un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_crear_carro
    @id_equipo INT,
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cantidad_carros INT;

    -- Contar carros actuales del equipo
    SELECT @cantidad_carros = COUNT(*)
    FROM dbo.carro
    WHERE id_equipo = @id_equipo;

    -- Validar límite máximo de 2 carros por equipo
    IF @cantidad_carros >= 2
    BEGIN
        RAISERROR('Un equipo no puede tener más de 2 carros', 16, 1);
        RETURN;
    END;

    -- Insertar el nuevo carro
    INSERT INTO dbo.carro (id_equipo, nombre)
    VALUES (@id_equipo, @nombre);

    SELECT 'Carro creado correctamente' AS resultado;
END;
GO

-- =========================================
-- Garantizar “solo un setup actual por carro”
-- =========================================
CREATE UNIQUE INDEX UX_car_setup_actual_por_carro
ON dbo.car_setup(car_id)
WHERE es_actual = 1;
GO


-- =========================================
-- Obtener o crear setup actual del carro
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_get_or_create_setup_actual
  @id_carro INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.carro WHERE id_carro = @id_carro)
  BEGIN
    RAISERROR('El carro no existe', 16, 1);
    RETURN;
  END;

  DECLARE @setup_id INT;

  SELECT @setup_id = setup_id
  FROM dbo.car_setup
  WHERE car_id = @id_carro AND es_actual = 1;

  IF @setup_id IS NULL
  BEGIN
    BEGIN TRY
      BEGIN TRAN;

      -- por seguridad: desactiva otros actuales (por si existiera data vieja)
      UPDATE dbo.car_setup
      SET es_actual = 0
      WHERE car_id = @id_carro AND es_actual = 1;

      INSERT INTO dbo.car_setup (car_id, es_actual)
      VALUES (@id_carro, 1);

      SET @setup_id = SCOPE_IDENTITY();

      COMMIT;
    END TRY
    BEGIN CATCH
      IF @@TRANCOUNT > 0 ROLLBACK;
      THROW;
    END CATCH
  END

  SELECT @setup_id AS setup_id;
END;
GO


-- =========================================
-- Ver setup del carro + totales P/A/M y “completitud”
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_ver_setup_carro
  @id_carro INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @setup_id INT;

  SELECT @setup_id = setup_id
  FROM dbo.car_setup
  WHERE car_id = @id_carro AND es_actual = 1;

  IF @setup_id IS NULL
  BEGIN
    -- si no hay setup actual, lo creamos
    EXEC dbo.sp_get_or_create_setup_actual @id_carro = @id_carro;
    SELECT @setup_id = setup_id
    FROM dbo.car_setup
    WHERE car_id = @id_carro AND es_actual = 1;
  END

  ;WITH piezas AS (
    SELECT
      csp.category_id,
      pc.nombre AS categoria,
      p.id_pieza,
      p.nombre AS pieza,
      p.p, p.a, p.m
    FROM dbo.car_setup_pieza csp
    JOIN dbo.part_category pc ON pc.category_id = csp.category_id
    JOIN dbo.pieza p ON p.id_pieza = csp.part_id
    WHERE csp.setup_id = @setup_id
  )
  SELECT
    @id_carro AS id_carro,
    @setup_id AS setup_id,
    ISNULL(SUM(p), 0) AS P_total,
    ISNULL(SUM(a), 0) AS A_total,
    ISNULL(SUM(m), 0) AS M_total,
    COUNT(*) AS categorias_instaladas,
    CASE WHEN COUNT(*) = 5 THEN 1 ELSE 0 END AS setup_completo
  FROM piezas;

  -- detalle por categoría (para pintar UI)
  SELECT
    pc.category_id,
    pc.nombre AS categoria,
    pz.id_pieza,
    pz.nombre AS pieza,
    pz.p, pz.a, pz.m
  FROM dbo.part_category pc
  LEFT JOIN dbo.car_setup_pieza csp
    ON csp.category_id = pc.category_id
    AND csp.setup_id = @setup_id
  LEFT JOIN dbo.pieza pz
    ON pz.id_pieza = csp.part_id
  ORDER BY pc.category_id;
END;
GO


-- =========================================
-- Listar inventario del equipo filtrado por categoría
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_por_categoria
  @id_equipo INT,
  @category_id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    ie.id_pieza,
    p.nombre,
    ie.cantidad,
    p.p, p.a, p.m,
    p.precio
  FROM dbo.inventario_equipo ie
  JOIN dbo.pieza p ON p.id_pieza = ie.id_pieza
  WHERE ie.id_equipo = @id_equipo
    AND p.categoria_id = @category_id
    AND ie.cantidad > 0
  ORDER BY p.nombre;
END;
GO


-- =========================================
-- Instalar / Reemplazar pieza (con transacción)
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_instalar_o_reemplazar_pieza
  @id_carro INT,
  @id_equipo INT,
  @part_id INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @setup_id INT;
  DECLARE @category_id INT;
  DECLARE @old_part_id INT;

  -- Validar carro y que pertenece al equipo
  IF NOT EXISTS (SELECT 1 FROM dbo.carro WHERE id_carro = @id_carro AND id_equipo = @id_equipo)
  BEGIN
    RAISERROR('El carro no existe o no pertenece al equipo', 16, 1);
    RETURN;
  END;

  -- Validar pieza y obtener categoría
  SELECT @category_id = categoria_id
  FROM dbo.pieza
  WHERE id_pieza = @part_id;

  IF @category_id IS NULL
  BEGIN
    RAISERROR('La pieza no existe', 16, 1);
    RETURN;
  END;

  -- Asegurar setup actual
  EXEC dbo.sp_get_or_create_setup_actual @id_carro = @id_carro;
  SELECT @setup_id = setup_id
  FROM dbo.car_setup
  WHERE car_id = @id_carro AND es_actual = 1;

  BEGIN TRY
    BEGIN TRAN;

    -- Lock de la fila de inventario de la pieza nueva
    DECLARE @qty INT;
    SELECT @qty = cantidad
    FROM dbo.inventario_equipo WITH (UPDLOCK, ROWLOCK, HOLDLOCK)
    WHERE id_equipo = @id_equipo AND id_pieza = @part_id;

    IF @qty IS NULL OR @qty <= 0
    BEGIN
      RAISERROR('No hay stock en inventario para instalar esta pieza', 16, 1);
      ROLLBACK;
      RETURN;
    END;

    -- Ver si ya había pieza instalada en esa categoría
    SELECT @old_part_id = part_id
    FROM dbo.car_setup_pieza WITH (UPDLOCK, ROWLOCK, HOLDLOCK)
    WHERE setup_id = @setup_id AND category_id = @category_id;

    -- Si había, devolverla al inventario
    IF @old_part_id IS NOT NULL
    BEGIN
      MERGE dbo.inventario_equipo AS tgt
      USING (SELECT @id_equipo AS id_equipo, @old_part_id AS id_pieza) AS src
      ON (tgt.id_equipo = src.id_equipo AND tgt.id_pieza = src.id_pieza)
      WHEN MATCHED THEN
        UPDATE SET cantidad = tgt.cantidad + 1, last_update = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (id_equipo, id_pieza, cantidad, last_update)
        VALUES (src.id_equipo, src.id_pieza, 1, SYSUTCDATETIME());
    END;

    -- Instalar (insert o update) la nueva pieza en el setup
    IF @old_part_id IS NULL
    BEGIN
      INSERT INTO dbo.car_setup_pieza (setup_id, category_id, part_id)
      VALUES (@setup_id, @category_id, @part_id);
    END
    ELSE
    BEGIN
      UPDATE dbo.car_setup_pieza
      SET part_id = @part_id
      WHERE setup_id = @setup_id AND category_id = @category_id;
    END;

    -- Descontar inventario de la nueva pieza
    UPDATE dbo.inventario_equipo
    SET cantidad = cantidad - 1,
        last_update = SYSUTCDATETIME()
    WHERE id_equipo = @id_equipo AND id_pieza = @part_id;

    COMMIT;

    SELECT 'OK' AS resultado, @setup_id AS setup_id, @category_id AS category_id;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
GO


-- =========================================
-- Finalizar carro (solo si están las 5 categorías)
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_finalizar_carro
  @id_carro INT,
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @setup_id INT;

  IF NOT EXISTS (SELECT 1 FROM dbo.carro WHERE id_carro = @id_carro AND id_equipo = @id_equipo)
  BEGIN
    RAISERROR('El carro no existe o no pertenece al equipo', 16, 1);
    RETURN;
  END;

  SELECT @setup_id = setup_id
  FROM dbo.car_setup
  WHERE car_id = @id_carro AND es_actual = 1;

  IF @setup_id IS NULL
  BEGIN
    RAISERROR('El carro no tiene setup actual', 16, 1);
    RETURN;
  END;

  DECLARE @count INT;
  SELECT @count = COUNT(*)
  FROM dbo.car_setup_pieza
  WHERE setup_id = @setup_id;

  IF @count <> 5
  BEGIN
    RAISERROR('No se puede finalizar: faltan categorías por instalar (requiere 5)', 16, 1);
    RETURN;
  END;

      -- dentro de dbo.sp_finalizar_carro, antes del UPDATE finalizado = 1:
    IF EXISTS (
      SELECT 1 FROM dbo.carro
      WHERE id_carro = @id_carro AND id_equipo = @id_equipo AND id_conductor IS NULL
    )
    BEGIN
      RAISERROR('No se puede finalizar: el carro no tiene conductor asignado', 16, 1);
      RETURN;
    END;

  UPDATE dbo.carro
  SET finalizado = 1
  WHERE id_carro = @id_carro;

  SELECT 'Carro finalizado' AS resultado, @setup_id AS setup_id;
END;
GO

-- =========================================
-- Listar Carros por Equipos
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_carros_por_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id_carro,
    id_equipo,
    nombre,
    finalizado
  FROM dbo.carro
  WHERE id_equipo = @id_equipo
  ORDER BY id_carro ASC;
END;
GO

-- =========================================
-- Asignacion de conductor al carro
-- =========================================
ALTER TABLE dbo.carro
ADD id_conductor INT NULL;

ALTER TABLE dbo.carro
ADD CONSTRAINT fk_carro_conductor
FOREIGN KEY (id_conductor) REFERENCES dbo.conductor(id_conductor);
GO


CREATE OR ALTER PROCEDURE dbo.sp_asignar_conductor_a_carro
  @id_carro INT,
  @id_equipo INT,
  @id_conductor INT
AS
BEGIN
  SET NOCOUNT ON;

  -- carro existe y pertenece al equipo
  IF NOT EXISTS (
    SELECT 1 FROM dbo.carro
    WHERE id_carro = @id_carro AND id_equipo = @id_equipo
  )
  BEGIN
    RAISERROR('El carro no existe o no pertenece al equipo', 16, 1);
    RETURN;
  END;

  -- conductor existe y pertenece al equipo
  IF NOT EXISTS (
    SELECT 1 FROM dbo.conductor
    WHERE id_conductor = @id_conductor AND id_equipo = @id_equipo
  )
  BEGIN
    RAISERROR('El conductor no existe o no pertenece al equipo', 16, 1);
    RETURN;
  END;

  -- (Opcional) evitar que el mismo conductor esté asignado a 2 carros del mismo equipo
  IF EXISTS (
    SELECT 1 FROM dbo.carro
    WHERE id_equipo = @id_equipo
      AND id_conductor = @id_conductor
      AND id_carro <> @id_carro
  )
  BEGIN
    RAISERROR('Ese conductor ya está asignado a otro carro del equipo', 16, 1);
    RETURN;
  END;

  UPDATE dbo.carro
  SET id_conductor = @id_conductor
  WHERE id_carro = @id_carro;

  SELECT 'OK' AS resultado, @id_carro AS id_carro, @id_conductor AS id_conductor;
END;
GO


CREATE OR ALTER PROCEDURE dbo.sp_carros_por_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    c.id_carro,
    c.id_equipo,
    c.nombre,
    c.finalizado,
    c.id_conductor,
    co.nombre AS conductor_nombre,
    co.habilidad_h
  FROM dbo.carro c
  LEFT JOIN dbo.conductor co ON co.id_conductor = c.id_conductor
  WHERE c.id_equipo = @id_equipo
  ORDER BY c.id_carro ASC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_quitar_conductor_de_carro
  @id_carro INT,
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.carro WHERE id_carro=@id_carro AND id_equipo=@id_equipo)
  BEGIN
    RAISERROR('El carro no existe o no pertenece al equipo', 16, 1);
    RETURN;
  END;

  UPDATE dbo.carro
  SET id_conductor = NULL
  WHERE id_carro = @id_carro;

  SELECT 'OK' AS resultado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_conductores_por_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id_conductor,
    id_equipo,
    nombre,
    habilidad_h,
    id_usuario
  FROM dbo.conductor
  WHERE id_equipo = @id_equipo
  ORDER BY nombre ASC;
END;
GO



