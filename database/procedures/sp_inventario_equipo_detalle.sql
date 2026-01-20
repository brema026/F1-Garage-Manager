USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_detalle
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.id_pieza,
        p.nombre AS parte,
        c.nombre AS categoria,
        i.cantidad,
        MIN(ce.fecha_compra) AS fecha_adquisicion
    FROM dbo.inventario_equipo i
    JOIN dbo.pieza p
        ON p.id_pieza = i.id_pieza
    JOIN dbo.part_category c
        ON c.category_id = p.categoria_id
    LEFT JOIN dbo.compra_equipo ce
        ON ce.id_equipo = i.id_equipo
       AND ce.id_pieza  = i.id_pieza
    WHERE i.id_equipo = @id_equipo
    GROUP BY
        i.id_pieza, p.nombre, c.nombre, i.cantidad
    ORDER BY
        p.nombre;
END;
GO

