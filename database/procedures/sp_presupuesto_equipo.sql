USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_presupuesto_equipo
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
    e.id_equipo,
    e.nombre AS nombre_equipo,
    ISNULL(SUM(a.monto), 0) AS presupuesto
  FROM dbo.equipo e
  LEFT JOIN dbo.aporte a ON a.id_equipo = e.id_equipo
  WHERE e.id_equipo = @id_equipo
  GROUP BY e.id_equipo, e.nombre;
END;
GO
