USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_reducir
    @id_equipo INT,
    @id_pieza  INT,
    @cantidad  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @cantidad IS NULL OR @cantidad <= 0
    BEGIN
        RAISERROR('La cantidad debe ser mayor a 0', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo)
    BEGIN
        RAISERROR('El equipo no existe', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.pieza WHERE id_pieza = @id_pieza)
    BEGIN
        RAISERROR('La pieza no existe', 16, 1);
        RETURN;
    END;

    DECLARE @actual INT;

    SELECT @actual = cantidad
    FROM dbo.inventario_equipo
    WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

    IF @actual IS NULL
    BEGIN
        RAISERROR('La pieza no está en el inventario del equipo', 16, 1);
        RETURN;
    END;

    IF @cantidad > @actual
    BEGIN
        RAISERROR('No puedes eliminar más de lo disponible en inventario', 16, 1);
        RETURN;
    END;

    DECLARE @nuevo INT = @actual - @cantidad;

    IF @nuevo = 0
    BEGIN
        DELETE FROM dbo.inventario_equipo
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;
    END
    ELSE
    BEGIN
        UPDATE dbo.inventario_equipo
        SET cantidad = @nuevo,
            last_update = SYSUTCDATETIME()
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;
    END;

    SELECT 
        @id_equipo AS id_equipo,
        @id_pieza  AS id_pieza,
        @actual    AS cantidad_antes,
        @nuevo     AS cantidad_despues;
END;
GO
