CREATE OR ALTER PROCEDURE dbo.sp_comprar_pieza_equipo
  @id_equipo INT,
  @id_pieza  INT,
  @cantidad  INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @precio DECIMAL(12,2);
  DECLARE @stock INT;
  DECLARE @aportes DECIMAL(12,2);
  DECLARE @gastos DECIMAL(12,2);
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

  SET @total = @precio * @cantidad;

  -- Presupuesto (aportes - gastos)
  SELECT @aportes = ISNULL(SUM(monto), 0)
  FROM dbo.aporte
  WHERE id_equipo = @id_equipo;

  SELECT @gastos = ISNULL(SUM(total), 0)
  FROM dbo.compra_equipo
  WHERE id_equipo = @id_equipo;

  SET @presupuesto = @aportes - @gastos;

  IF @presupuesto < @total
  BEGIN
    RAISERROR('Presupuesto insuficiente', 16, 1);
    RETURN;
  END;

  BEGIN TRANSACTION;

  BEGIN TRY
    -- Stock (con lock para evitar compras simultáneas)
    SELECT @stock = stock_disponible
    FROM dbo.part_stock WITH (UPDLOCK, HOLDLOCK)
    WHERE part_id = @id_pieza;

    IF @stock IS NULL OR @stock < @cantidad
    BEGIN
      RAISERROR('Stock insuficiente', 16, 1);
      ROLLBACK;
      RETURN;
    END;

    -- 1) Disminuir stock
    UPDATE dbo.part_stock
    SET stock_disponible = stock_disponible - @cantidad,
        last_update = SYSUTCDATETIME()
    WHERE part_id = @id_pieza;

    -- 2) Agregar al inventario del equipo
    IF EXISTS (
      SELECT 1
      FROM dbo.inventario_equipo
      WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza
    )
    BEGIN
      UPDATE dbo.inventario_equipo
      SET cantidad = cantidad + @cantidad,
          last_update = SYSUTCDATETIME()
      WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;
    END
    ELSE
    BEGIN
      INSERT INTO dbo.inventario_equipo (id_equipo, id_pieza, cantidad)
      VALUES (@id_equipo, @id_pieza, @cantidad);
    END;

    -- 3) Registrar historial (gasto)
    INSERT INTO dbo.compra_equipo (id_equipo, id_pieza, cantidad, precio_unit, total)
    VALUES (@id_equipo, @id_pieza, @cantidad, @precio, @total);

    COMMIT;

    SELECT
      'Compra realizada correctamente' AS resultado,
      @total AS total_compra,
      (@presupuesto - @total) AS presupuesto_restante;

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    RAISERROR(ERROR_MESSAGE(), 16, 1);
  END CATCH
END;
GO
