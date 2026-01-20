USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_registrar_patrocinador
  @nombre NVARCHAR(120),
  @email  NVARCHAR(200) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = ''
  BEGIN
    RAISERROR('El nombre del patrocinador es requerido.', 16, 1);
    RETURN;
  END;

  -- Si viene email vacío, lo tratamos como NULL
  IF @email IS NOT NULL AND LTRIM(RTRIM(@email)) = ''
    SET @email = NULL;

  -- Si email no es NULL, debe ser único (ya existe uq_patrocinador_email)
  IF @email IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.patrocinador WHERE email = @email)
  BEGIN
    RAISERROR('Ya existe un patrocinador con ese email.', 16, 1);
    RETURN;
  END;

  INSERT INTO dbo.patrocinador(nombre, email)
  VALUES (@nombre, @email);

  SELECT
    SCOPE_IDENTITY() AS id_patrocinador,
    @nombre AS nombre,
    @email AS email;
END;
GO
