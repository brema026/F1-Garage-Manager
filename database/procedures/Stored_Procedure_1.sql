CREATE OR ALTER PROCEDURE dbo.sp_presupuesto_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.id_equipo,
        e.nombre,
        ISNULL(SUM(a.monto), 0) AS presupuesto_total
    FROM dbo.equipo e
    LEFT JOIN dbo.aporte a
        ON a.id_equipo = e.id_equipo
    WHERE e.id_equipo = @id_equipo
    GROUP BY e.id_equipo, e.nombre;
END;
GO
