USE f1_garage_tec;
GO

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
