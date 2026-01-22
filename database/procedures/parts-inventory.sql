-- =====================================================================
-- Archivo: parts-inventory.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de piezas, stock de tienda,
--              inventario de equipos y compras
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Agregar stock a una pieza existente
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_agregar_stock_pieza
    @id_pieza INT,
    @cantidad INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar cantidad positiva
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

    -- Actualizar stock si existe, insertar si no
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

-- =========================================
-- Comprar pieza para un equipo (transacción)
-- =========================================
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

    -- Validar cantidad positiva
    IF @cantidad <= 0
    BEGIN
        RAISERROR('La cantidad debe ser mayor a cero', 16, 1);
        RETURN;
    END;

    -- Obtener precio de la pieza
    SELECT @precio = precio
    FROM dbo.pieza
    WHERE id_pieza = @id_pieza;

    IF @precio IS NULL
    BEGIN
        RAISERROR('La pieza no existe', 16, 1);
        RETURN;
    END;

    -- Validar stock disponible
    SELECT @stock = stock_disponible
    FROM dbo.part_stock
    WHERE part_id = @id_pieza;

    IF @stock IS NULL OR @stock < @cantidad
    BEGIN
        RAISERROR('Stock insuficiente', 16, 1);
        RETURN;
    END;

    -- Calcular presupuesto del equipo
    SELECT @presupuesto = ISNULL(SUM(monto), 0)
    FROM dbo.aporte
    WHERE id_equipo = @id_equipo;

    SET @total = @precio * @cantidad;

    -- Validar presupuesto suficiente
    IF @presupuesto < @total
    BEGIN
        RAISERROR('Presupuesto insuficiente', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Reducir stock de tienda
        UPDATE dbo.part_stock
        SET stock_disponible = stock_disponible - @cantidad,
            last_update = SYSUTCDATETIME()
        WHERE part_id = @id_pieza;

        -- Agregar al inventario del equipo
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

        -- Registrar compra para auditoría
        INSERT INTO dbo.compra_equipo
            (id_equipo, id_pieza, cantidad, precio_unit, total)
        VALUES
            (@id_equipo, @id_pieza, @cantidad, @precio, @total);

        COMMIT TRANSACTION;
        SELECT 'Compra realizada correctamente' AS resultado;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =========================================
-- Eliminar pieza del inventario de equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_eliminar_item
    @id_equipo INT,
    @id_pieza  INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar que exista en inventario
    IF NOT EXISTS (SELECT 1 FROM dbo.inventario_equipo WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza)
    BEGIN
        RAISERROR('La pieza no está en el inventario del equipo', 16, 1);
        RETURN;
    END;

    -- Eliminar del inventario
    DELETE FROM dbo.inventario_equipo
    WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

    SELECT 
        @id_equipo AS id_equipo,
        @id_pieza AS id_pieza,
        'Eliminado' AS estado;
END;
GO

-- =========================================
-- Eliminar pieza completa del sistema
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_pieza_completa
  @id_pieza INT,
  @forzar_eliminar_en_setups BIT = 0
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  -- Validar id_pieza
  IF @id_pieza IS NULL OR @id_pieza <= 0
  BEGIN
    RAISERROR('id_pieza inválido.', 16, 1);
    RETURN;
  END;

  -- Verificar que exista
  IF NOT EXISTS (SELECT 1 FROM dbo.pieza WHERE id_pieza = @id_pieza)
  BEGIN
    RAISERROR('La pieza no existe.', 16, 1);
    RETURN;
  END;

  BEGIN TRY
    BEGIN TRAN;

    -- Verificar si está en setups de carros
    IF EXISTS (SELECT 1 FROM dbo.car_setup_pieza WHERE part_id = @id_pieza)
    BEGIN
      -- Bloquear o forzar según parámetro
      IF @forzar_eliminar_en_setups = 0
      BEGIN
        RAISERROR('No se puede eliminar: la pieza está asignada en car_setup_pieza.', 16, 1);
        ROLLBACK TRAN;
        RETURN;
      END;

      -- Eliminar de setups si se fuerza
      DELETE FROM dbo.car_setup_pieza
      WHERE part_id = @id_pieza;
    END;

    -- Eliminar historial de compras
    DELETE FROM dbo.compra_equipo
    WHERE id_pieza = @id_pieza;

    -- Eliminar de inventarios de equipos
    DELETE FROM dbo.inventario_equipo
    WHERE id_pieza = @id_pieza;

    -- Eliminar stock global
    DELETE FROM dbo.part_stock
    WHERE part_id = @id_pieza;

    -- Eliminar pieza
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

-- =========================================
-- Obtener inventario detallado de un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_detalle
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Inventario con categoría y fecha de adquisición
    SELECT
        i.id_pieza,
        p.nombre AS parte,
        c.nombre AS categoria,
        i.cantidad,
        MIN(ce.fecha_compra) AS fecha_adquisicion
    FROM dbo.inventario_equipo i
    JOIN dbo.pieza p
        ON p.id_pieza = i.id_pieza
    JOIN dbo.part_category c
        ON c.category_id = p.categoria_id
    LEFT JOIN dbo.compra_equipo ce
        ON ce.id_equipo = i.id_equipo
       AND ce.id_pieza  = i.id_pieza
    WHERE i.id_equipo = @id_equipo
    GROUP BY
        i.id_pieza, p.nombre, c.nombre, i.cantidad
    ORDER BY
        p.nombre;
END;
GO

-- =========================================
-- Obtener inventario simple de un equipo
-- =========================================
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

-- =========================================
-- Listar todas las categorías de piezas
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_categorias
AS
BEGIN
  SET NOCOUNT ON;

  SELECT category_id, nombre
  FROM dbo.part_category
  ORDER BY nombre;
END;
GO

-- =========================================
-- Listar todas las piezas con stock
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_piezas
AS
BEGIN
    SET NOCOUNT ON;

    -- Piezas con categoría y stock disponible
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

-- =========================================
-- Reducir cantidad en inventario de equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_inventario_equipo_reducir
    @id_equipo INT,
    @id_pieza  INT,
    @cantidad  INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar cantidad positiva
    IF @cantidad IS NULL OR @cantidad <= 0
    BEGIN
        RAISERROR('La cantidad debe ser mayor a 0', 16, 1);
        RETURN;
    END;

    -- Validar que el equipo exista
    IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo)
    BEGIN
        RAISERROR('El equipo no existe', 16, 1);
        RETURN;
    END;

    -- Validar que la pieza exista
    IF NOT EXISTS (SELECT 1 FROM dbo.pieza WHERE id_pieza = @id_pieza)
    BEGIN
        RAISERROR('La pieza no existe', 16, 1);
        RETURN;
    END;

    DECLARE @actual INT;

    -- Obtener cantidad actual en inventario
    SELECT @actual = cantidad
    FROM dbo.inventario_equipo
    WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

    IF @actual IS NULL
    BEGIN
        RAISERROR('La pieza no está en el inventario del equipo', 16, 1);
        RETURN;
    END;

    -- Validar que no se reduzca más de lo disponible
    IF @cantidad > @actual
    BEGIN
        RAISERROR('No puedes eliminar más de lo disponible en inventario', 16, 1);
        RETURN;
    END;

    DECLARE @nuevo INT = @actual - @cantidad;

    -- Eliminar registro si queda en 0, actualizar si no
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

    -- Retornar resultado
    SELECT 
        @id_equipo AS id_equipo,
        @id_pieza  AS id_pieza,
        @actual    AS cantidad_antes,
        @nuevo     AS cantidad_despues;
END;
GO

-- =========================================
-- Reducir stock global de una pieza
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_reducir_stock_pieza
  @id_pieza  INT,
  @cantidad  INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  -- Validar id_pieza
  IF @id_pieza IS NULL OR @id_pieza <= 0
  BEGIN
    RAISERROR('id_pieza inválido.', 16, 1);
    RETURN;
  END;

  -- Validar cantidad positiva
  IF @cantidad IS NULL OR @cantidad <= 0
  BEGIN
    RAISERROR('La cantidad debe ser mayor a cero.', 16, 1);
    RETURN;
  END;

  -- Verificar que tenga registro de stock
  IF NOT EXISTS (SELECT 1 FROM dbo.part_stock WHERE part_id = @id_pieza)
  BEGIN
    RAISERROR('La pieza no tiene registro en part_stock.', 16, 1);
    RETURN;
  END;

  DECLARE @stock INT;
  SELECT @stock = stock_disponible
  FROM dbo.part_stock
  WHERE part_id = @id_pieza;

  -- Validar stock suficiente
  IF @stock < @cantidad
  BEGIN
    RAISERROR('No hay suficiente stock para reducir esa cantidad.', 16, 1);
    RETURN;
  END;

  -- Reducir stock
  UPDATE dbo.part_stock
  SET stock_disponible = stock_disponible - @cantidad,
      last_update = SYSUTCDATETIME()
  WHERE part_id = @id_pieza;

  -- Retornar resultado
  SELECT
    'Stock reducido correctamente' AS message,
    @id_pieza AS id_pieza,
    @cantidad AS cantidad_reducida,
    (SELECT stock_disponible FROM dbo.part_stock WHERE part_id = @id_pieza) AS stock_actual;
END;
GO

-- =========================================
-- Registrar nueva pieza en el sistema
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_registrar_pieza
    @nombre         NVARCHAR(120),
    @precio         DECIMAL(12,2),
    @p              TINYINT,
    @a              TINYINT,
    @m              TINYINT,
    @categoria_id   INT,
    @stock_inicial  INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    -- Validar que la categoría exista
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.part_category
        WHERE category_id = @categoria_id
    )
    BEGIN
        RAISERROR('La categoría no existe', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Insertar pieza
    INSERT INTO dbo.pieza (nombre, precio, p, a, m, categoria_id)
    VALUES (@nombre, @precio, @p, @a, @m, @categoria_id);

    DECLARE @id_pieza INT;
    SET @id_pieza = SCOPE_IDENTITY();

    -- Insertar stock inicial
    INSERT INTO dbo.part_stock (part_id, stock_disponible)
    VALUES (@id_pieza, @stock_inicial);

    COMMIT TRANSACTION;

    -- Retornar resultado
    SELECT 
        'Pieza registrada correctamente' AS resultado,
        @id_pieza AS id_pieza;
END;
GO