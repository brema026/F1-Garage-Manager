USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_registrar_aporte
  @id_equipo        INT,
  @id_patrocinador  INT,
  @fecha            DATE = NULL,
  @monto            DECIMAL(12,2),
  @descripcion      NVARCHAR(300) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido (no puede ser 0 ni NULL).', 16, 1);
    RETURN;
  END;

  IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo)
  BEGIN
    RAISERROR('El equipo no existe.', 16, 1);
    RETURN;
  END;

  IF @id_patrocinador IS NULL OR @id_patrocinador <= 0
  BEGIN
    RAISERROR('id_patrocinador inválido.', 16, 1);
    RETURN;
  END;

  IF NOT EXISTS (SELECT 1 FROM dbo.patrocinador WHERE id_patrocinador = @id_patrocinador)
  BEGIN
    RAISERROR('El patrocinador no existe.', 16, 1);
    RETURN;
  END;

  IF @monto IS NULL OR @monto <= 0
  BEGIN
    RAISERROR('El monto debe ser mayor a 0.', 16, 1);
    RETURN;
  END;

  IF @fecha IS NULL
    SET @fecha = CONVERT(DATE, SYSUTCDATETIME());

  -- Normalizar descripcion vacía
  IF @descripcion IS NOT NULL AND LTRIM(RTRIM(@descripcion)) = ''
    SET @descripcion = NULL;

  INSERT INTO dbo.aporte (id_patrocinador, id_equipo, fecha, monto, descripcion)
  VALUES (@id_patrocinador, @id_equipo, @fecha, @monto, @descripcion);

  SELECT
    SCOPE_IDENTITY() AS id_aporte,
    @id_equipo AS id_equipo,
    @id_patrocinador AS id_patrocinador,
    @fecha AS fecha,
    @monto AS monto,
    @descripcion AS descripcion;
END;
GO
