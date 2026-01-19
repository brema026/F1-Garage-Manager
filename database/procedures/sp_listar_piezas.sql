CREATE OR ALTER PROCEDURE dbo.sp_listar_piezas
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.id_pieza,
        p.nombre,
        p.precio,
        p.p AS potencia,
        p.a AS aerodinamica,
        p.m AS manejabilidad,
        c.category_id,
        c.nombre AS categoria,
        ISNULL(s.stock_disponible, 0) AS stock,
        s.last_update
    FROM dbo.pieza p
    INNER JOIN dbo.part_category c
        ON c.category_id = p.categoria_id
    LEFT JOIN dbo.part_stock s
        ON s.part_id = p.id_pieza
    ORDER BY c.nombre, p.nombre;
END;
GO
