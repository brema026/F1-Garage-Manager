USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.id_pieza,
        p.nombre,
        i.cantidad
    FROM dbo.inventario_equipo i
    JOIN dbo.pieza p ON p.id_pieza = i.id_pieza
    WHERE i.id_equipo = @id_equipo;
END;
GO
