-- =====================================================================
-- Archivo: sponsors.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de patrocinadores, aportes
--              y cálculo de presupuesto/saldo de equipos
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Listar aportes de un equipo específico
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_aportes_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar id_equipo
  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido.', 16, 1);
    RETURN;
  END;

  -- Obtener aportes con info de equipo y patrocinador
  SELECT
    a.id_aporte,
    a.id_equipo,
    e.nombre AS equipo,
    a.id_patrocinador,
    p.nombre AS patrocinador,
    p.email,
    a.fecha,
    a.monto,
    a.descripcion
  FROM dbo.aporte a
  INNER JOIN dbo.equipo e ON e.id_equipo = a.id_equipo
  INNER JOIN dbo.patrocinador p ON p.id_patrocinador = a.id_patrocinador
  WHERE a.id_equipo = @id_equipo
  ORDER BY a.fecha DESC, a.id_aporte DESC;
END;
GO

-- =========================================
-- Listar todos los patrocinadores
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_patrocinadores
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id_patrocinador,
    nombre,
    email
  FROM dbo.patrocinador
  ORDER BY nombre ASC;
END;
GO

-- =========================================
-- Listar patrocinadores de un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_patrocinadores_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Obtener patrocinadores con sus aportes al equipo
    SELECT
        p.id_patrocinador,
        p.nombre,
        a.monto,
        a.fecha
    FROM dbo.aporte a
    JOIN dbo.patrocinador p ON p.id_patrocinador = a.id_patrocinador
    WHERE a.id_equipo = @id_equipo;
END;
GO

-- =========================================
-- Obtener presupuesto total de un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_presupuesto_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar id_equipo
  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido.', 16, 1);
    RETURN;
  END;

  -- Sumar todos los aportes del equipo
  SELECT
    e.id_equipo,
    e.nombre AS nombre_equipo,
    ISNULL(SUM(a.monto), 0) AS presupuesto
  FROM dbo.equipo e
  LEFT JOIN dbo.aporte a ON a.id_equipo = e.id_equipo
  WHERE e.id_equipo = @id_equipo
  GROUP BY e.id_equipo, e.nombre;
END;
GO

-- =========================================
-- Registrar un nuevo aporte a un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_registrar_aporte
  @id_equipo        INT,
  @id_patrocinador  INT,
  @fecha            DATE = NULL,
  @monto            DECIMAL(12,2),
  @descripcion      NVARCHAR(300) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar id_equipo
  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido (no puede ser 0 ni NULL).', 16, 1);
    RETURN;
  END;

  -- Verificar que el equipo exista
  IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo)
  BEGIN
    RAISERROR('El equipo no existe.', 16, 1);
    RETURN;
  END;

  -- Validar id_patrocinador
  IF @id_patrocinador IS NULL OR @id_patrocinador <= 0
  BEGIN
    RAISERROR('id_patrocinador inválido.', 16, 1);
    RETURN;
  END;

  -- Verificar que el patrocinador exista
  IF NOT EXISTS (SELECT 1 FROM dbo.patrocinador WHERE id_patrocinador = @id_patrocinador)
  BEGIN
    RAISERROR('El patrocinador no existe.', 16, 1);
    RETURN;
  END;

  -- Validar monto positivo
  IF @monto IS NULL OR @monto <= 0
  BEGIN
    RAISERROR('El monto debe ser mayor a 0.', 16, 1);
    RETURN;
  END;

  -- Usar fecha actual si no se proporciona
  IF @fecha IS NULL
    SET @fecha = CONVERT(DATE, SYSUTCDATETIME());

  -- Normalizar descripción vacía a NULL
  IF @descripcion IS NOT NULL AND LTRIM(RTRIM(@descripcion)) = ''
    SET @descripcion = NULL;

  -- Insertar el aporte
  INSERT INTO dbo.aporte (id_patrocinador, id_equipo, fecha, monto, descripcion)
  VALUES (@id_patrocinador, @id_equipo, @fecha, @monto, @descripcion);

  -- Retornar datos del aporte creado
  SELECT
    SCOPE_IDENTITY() AS id_aporte,
    @id_equipo AS id_equipo,
    @id_patrocinador AS id_patrocinador,
    @fecha AS fecha,
    @monto AS monto,
    @descripcion AS descripcion;
END;
GO

-- =========================================
-- Registrar un nuevo patrocinador
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_registrar_patrocinador
  @nombre NVARCHAR(120),
  @email  NVARCHAR(200) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar nombre requerido
  IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = ''
  BEGIN
    RAISERROR('El nombre del patrocinador es requerido.', 16, 1);
    RETURN;
  END;

  -- Normalizar email vacío a NULL
  IF @email IS NOT NULL AND LTRIM(RTRIM(@email)) = ''
    SET @email = NULL;

  -- Verificar email único si se proporciona
  IF @email IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.patrocinador WHERE email = @email)
  BEGIN
    RAISERROR('Ya existe un patrocinador con ese email.', 16, 1);
    RETURN;
  END;

  -- Insertar patrocinador
  INSERT INTO dbo.patrocinador(nombre, email)
  VALUES (@nombre, @email);

  -- Retornar datos del patrocinador creado
  SELECT
    SCOPE_IDENTITY() AS id_patrocinador,
    @nombre AS nombre,
    @email AS email;
END;
GO

-- =========================================
-- Obtener saldo disponible de un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_saldo_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar id_equipo
  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido.', 16, 1);
    RETURN;
  END;

  -- CTE para calcular presupuesto (suma de aportes)
  ;WITH A AS (
    SELECT id_equipo, SUM(monto) AS presupuesto
    FROM dbo.aporte
    WHERE id_equipo = @id_equipo
    GROUP BY id_equipo
  ),
  -- CTE para calcular gastos (suma de compras)
  C AS (
    SELECT id_equipo, SUM(total) AS gasto
    FROM dbo.compra_equipo
    WHERE id_equipo = @id_equipo
    GROUP BY id_equipo
  )
  -- Calcular saldo = presupuesto - gastos
  SELECT
    e.id_equipo,
    e.nombre AS nombre_equipo,
    ISNULL(A.presupuesto, 0) AS presupuesto,
    ISNULL(C.gasto, 0) AS gasto,
    ISNULL(A.presupuesto, 0) - ISNULL(C.gasto, 0) AS saldo
  FROM dbo.equipo e
  LEFT JOIN A ON A.id_equipo = e.id_equipo
  LEFT JOIN C ON C.id_equipo = e.id_equipo
  WHERE e.id_equipo = @id_equipo;
END;
GO