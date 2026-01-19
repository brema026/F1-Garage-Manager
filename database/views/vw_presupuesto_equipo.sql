CREATE OR ALTER VIEW vw_presupuesto_equipo AS
SELECT
    e.id_equipo,
    e.nombre AS nombre_equipo,
    ISNULL(SUM(a.monto), 0) AS presupuesto
FROM equipo e
LEFT JOIN aporte a
    ON a.id_equipo = e.id_equipo
GROUP BY e.id_equipo, e.nombre;
GO

