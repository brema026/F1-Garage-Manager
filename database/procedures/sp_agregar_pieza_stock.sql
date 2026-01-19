CREATE OR ALTER PROCEDURE dbo.sp_agregar_stock_pieza
    @id_pieza INT,
    @cantidad INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar cantidad
    IF @cantidad <= 0
    BEGIN
        RAISERROR('La cantidad debe ser mayor a cero', 16, 1);
        RETURN;
    END;

    -- Validar que la pieza exista
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.pieza
        WHERE id_pieza = @id_pieza
    )
    BEGIN
        RAISERROR('La pieza no existe', 16, 1);
        RETURN;
    END;

    -- Insertar o actualizar stock
    IF EXISTS (
        SELECT 1
        FROM dbo.part_stock
        WHERE part_id = @id_pieza
    )
    BEGIN
        UPDATE dbo.part_stock
        SET stock_disponible = stock_disponible + @cantidad,
            last_update = SYSUTCDATETIME()
        WHERE part_id = @id_pieza;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.part_stock (part_id, stock_disponible)
        VALUES (@id_pieza, @cantidad);
    END;

    SELECT 'Stock actualizado correctamente' AS resultado;
END;
GO
