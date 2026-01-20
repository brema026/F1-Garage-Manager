USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_saldo_equipo
  @id_equipo INT
AS
BEGIN
  SET NOCOUNT ON;

  IF @id_equipo IS NULL OR @id_equipo <= 0
  BEGIN
    RAISERROR('id_equipo inválido.', 16, 1);
    RETURN;
  END;

  ;WITH A AS (
    SELECT id_equipo, SUM(monto) AS presupuesto
    FROM dbo.aporte
    WHERE id_equipo = @id_equipo
    GROUP BY id_equipo
  ),
  C AS (
    SELECT id_equipo, SUM(total) AS gasto
    FROM dbo.compra_equipo
    WHERE id_equipo = @id_equipo
    GROUP BY id_equipo
  )
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
