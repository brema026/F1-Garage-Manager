USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_eliminar_item
    @id_equipo INT,
    @id_pieza  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.inventario_equipo WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza)
    BEGIN
        RAISERROR('La pieza no está en el inventario del equipo', 16, 1);
        RETURN;
    END;

    DELETE FROM dbo.inventario_equipo
    WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

    SELECT 
        @id_equipo AS id_equipo,
        @id_pieza AS id_pieza,
        'Eliminado' AS estado;
END;
GO
