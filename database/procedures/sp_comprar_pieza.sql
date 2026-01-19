CREATE OR ALTER PROCEDURE dbo.sp_comprar_pieza_equipo
    @id_equipo INT,
    @id_pieza  INT,
    @cantidad  INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @precio DECIMAL(12,2);
    DECLARE @stock INT;
    DECLARE @presupuesto DECIMAL(12,2);
    DECLARE @total DECIMAL(12,2);

    -- Validar cantidad
    IF @cantidad <= 0
    BEGIN
        RAISERROR('La cantidad debe ser mayor a cero', 16, 1);
        RETURN;
    END;

    -- Precio de la pieza
    SELECT @precio = precio
    FROM dbo.pieza
    WHERE id_pieza = @id_pieza;

    IF @precio IS NULL
    BEGIN
        RAISERROR('La pieza no existe', 16, 1);
        RETURN;
    END;

    -- Stock disponible
    SELECT @stock = stock_disponible
    FROM dbo.part_stock
    WHERE part_id = @id_pieza;

    IF @stock IS NULL OR @stock < @cantidad
    BEGIN
        RAISERROR('Stock insuficiente', 16, 1);
        RETURN;
    END;

    -- Presupuesto del equipo (derivado de aportes)
    SELECT @presupuesto = ISNULL(SUM(monto), 0)
    FROM dbo.aporte
    WHERE id_equipo = @id_equipo;

    SET @total = @precio * @cantidad;

    IF @presupuesto < @total
    BEGIN
        RAISERROR('Presupuesto insuficiente', 16, 1);
        RETURN;
    END;

    BEGIN TRANSACTION;

    -- 1. Disminuir stock
    UPDATE dbo.part_stock
    SET stock_disponible = stock_disponible - @cantidad,
        last_update = SYSUTCDATETIME()
    WHERE part_id = @id_pieza;

    -- 2. Agregar al inventario del equipo
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

    -- 3. Registrar historial de compra
    INSERT INTO dbo.compra_equipo
        (id_equipo, id_pieza, cantidad, precio_unit, total)
    VALUES
        (@id_equipo, @id_pieza, @cantidad, @precio, @total);

    COMMIT TRANSACTION;

    SELECT 'Compra realizada correctamente' AS resultado;
END;
GO
