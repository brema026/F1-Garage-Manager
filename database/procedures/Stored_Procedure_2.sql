CREATE OR ALTER PROCEDURE dbo.sp_presupuesto_equipo
    @id_equipo INT,
    @id_pieza  INT,
    @cantidad  INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @precio DECIMAL(12,2);
    DECLARE @stock  INT;
    DECLARE @presupuesto DECIMAL(12,2);
    DECLARE @costo_total DECIMAL(12,2);

    -- Precio de la pieza
    SELECT @precio = precio
    FROM dbo.pieza
    WHERE id_pieza = @id_pieza;

    -- Stock disponible
    SELECT @stock = stock_disponible
    FROM dbo.part_stock
    WHERE part_id = @id_pieza;

    -- Presupuesto del equipo (derivado de aportes)
    SELECT @presupuesto = ISNULL(SUM(monto), 0)
    FROM dbo.aporte
    WHERE id_equipo = @id_equipo;

    SET @costo_total = @precio * @cantidad;

    -- Validaciones
    IF @stock < @cantidad
    BEGIN
        RAISERROR('Stock insuficiente', 16, 1);
        RETURN;
    END;

    IF @presupuesto < @costo_total
    BEGIN
        RAISERROR('Presupuesto insuficiente', 16, 1);
        RETURN;
    END;

    -- Actualizar stock
    UPDATE dbo.part_stock
    SET stock_disponible = stock_disponible - @cantidad,
        last_update = SYSUTCDATETIME()
    WHERE part_id = @id_pieza;

    -- Inventario del equipo
    IF EXISTS (
        SELECT 1
        FROM dbo.inventario_equipo
        WHERE id_equipo = @id_equipo
          AND id_pieza  = @id_pieza
    )
    BEGIN
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad + @cantidad,
            last_update = SYSUTCDATETIME()
        WHERE id_equipo = @id_equipo
          AND id_pieza  = @id_pieza;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.inventario_equipo (id_equipo, id_pieza, cantidad)
        VALUES (@id_equipo, @id_pieza, @cantidad);
    END;

    SELECT 'Compra registrada (versi�n preliminar)' AS resultado;
END;
GO
