USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_eliminar_pieza_completa
  @id_pieza INT,
  @forzar_eliminar_en_setups BIT = 0
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  IF @id_pieza IS NULL OR @id_pieza <= 0
  BEGIN
    RAISERROR('id_pieza inválido.', 16, 1);
    RETURN;
  END;

  IF NOT EXISTS (SELECT 1 FROM dbo.pieza WHERE id_pieza = @id_pieza)
  BEGIN
    RAISERROR('La pieza no existe.', 16, 1);
    RETURN;
  END;

  BEGIN TRY
    BEGIN TRAN;

    -- Si está en setups, decide si bloquea o fuerza
    IF EXISTS (SELECT 1 FROM dbo.car_setup_pieza WHERE part_id = @id_pieza)
    BEGIN
      IF @forzar_eliminar_en_setups = 0
      BEGIN
        RAISERROR('No se puede eliminar: la pieza está asignada en car_setup_pieza.', 16, 1);
        ROLLBACK TRAN;
        RETURN;
      END;

      DELETE FROM dbo.car_setup_pieza
      WHERE part_id = @id_pieza;
    END;

    -- historial compras
    DELETE FROM dbo.compra_equipo
    WHERE id_pieza = @id_pieza;

    -- inventario equipos
    DELETE FROM dbo.inventario_equipo
    WHERE id_pieza = @id_pieza;

    -- stock global
    DELETE FROM dbo.part_stock
    WHERE part_id = @id_pieza;

    -- pieza
    DELETE FROM dbo.pieza
    WHERE id_pieza = @id_pieza;

    COMMIT TRAN;

    SELECT
      'Pieza eliminada completamente (incluye historial e inventario).' AS message,
      @id_pieza AS id_pieza;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@msg, 16, 1);
  END CATCH
END;
GO
