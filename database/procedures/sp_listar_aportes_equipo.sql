USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_listar_aportes_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido.', 16, 1);
    RETURN;
  END;

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
