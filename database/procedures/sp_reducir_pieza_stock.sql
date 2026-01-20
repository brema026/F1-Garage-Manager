USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_reducir_stock_pieza
  @id_pieza  INT,
  @cantidad  INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  IF @id_pieza IS NULL OR @id_pieza <= 0
  BEGIN
    RAISERROR('id_pieza inválido.', 16, 1);
    RETURN;
  END;

  IF @cantidad IS NULL OR @cantidad <= 0
  BEGIN
    RAISERROR('La cantidad debe ser mayor a cero.', 16, 1);
    RETURN;
  END;

  IF NOT EXISTS (SELECT 1 FROM dbo.part_stock WHERE part_id = @id_pieza)
  BEGIN
    RAISERROR('La pieza no tiene registro en part_stock.', 16, 1);
    RETURN;
  END;

  DECLARE @stock INT;
  SELECT @stock = stock_disponible
  FROM dbo.part_stock
  WHERE part_id = @id_pieza;

  IF @stock < @cantidad
  BEGIN
    RAISERROR('No hay suficiente stock para reducir esa cantidad.', 16, 1);
    RETURN;
  END;

  UPDATE dbo.part_stock
  SET stock_disponible = stock_disponible - @cantidad,
      last_update = SYSUTCDATETIME()
  WHERE part_id = @id_pieza;

  SELECT
    'Stock reducido correctamente' AS message,
    @id_pieza AS id_pieza,
    @cantidad AS cantidad_reducida,
    (SELECT stock_disponible FROM dbo.part_stock WHERE part_id = @id_pieza) AS stock_actual;
END;
GO
