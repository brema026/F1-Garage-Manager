USE f1_garage_tec;
GO

-- =============================================
-- SP para remover una pieza del setup
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_remover_pieza_setup
    @id_carro INT,
    @category_id INT,
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @setup_id INT;
        DECLARE @part_id INT;
        DECLARE @carro_finalizado BIT;

        -- Validar que el carro existe y pertenece al equipo
        SELECT @carro_finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro AND id_equipo = @id_equipo;

        IF @carro_finalizado IS NULL
        BEGIN
            RAISERROR('El carro no existe o no pertenece a este equipo', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        IF @carro_finalizado = 1
        BEGIN
            RAISERROR('No puedes modificar un carro finalizado', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Obtener el setup actual
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        IF @setup_id IS NULL
        BEGIN
            RAISERROR('El carro no tiene un setup activo', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Obtener la pieza instalada en esta categoría
        SELECT @part_id = part_id
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id AND category_id = @category_id;

        IF @part_id IS NULL
        BEGIN
            RAISERROR('No hay ninguna pieza instalada en esta categoría', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Devolver la pieza al inventario
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad + 1,
            last_update = SYSUTCDATETIME()
        WHERE id_equipo = @id_equipo AND id_pieza = @part_id;

        -- Si no existe en el inventario, crear el registro
        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO dbo.inventario_equipo (id_equipo, id_pieza, cantidad)
            VALUES (@id_equipo, @part_id, 1);
        END;

        -- Remover la pieza del setup
        DELETE FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id AND category_id = @category_id;

        COMMIT TRANSACTION;

        SELECT 'Pieza removida correctamente' AS mensaje;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END;
GO

-- =============================================
-- SP para finalizar un carro
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_finalizar_carro
    @id_carro INT,
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @setup_id INT;
        DECLARE @piezas_instaladas INT;
        DECLARE @categorias_totales INT;
        DECLARE @carro_finalizado BIT;

        -- Validar que el carro existe y pertenece al equipo
        SELECT @carro_finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro AND id_equipo = @id_equipo;

        IF @carro_finalizado IS NULL
        BEGIN
            RAISERROR('El carro no existe o no pertenece a este equipo', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        IF @carro_finalizado = 1
        BEGIN
            RAISERROR('El carro ya está finalizado', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Obtener el setup actual
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        IF @setup_id IS NULL
        BEGIN
            RAISERROR('El carro no tiene un setup activo', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Contar piezas instaladas
        SELECT @piezas_instaladas = COUNT(*)
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id;

        -- Contar categorías totales
        SELECT @categorias_totales = COUNT(*)
        FROM dbo.part_category;

        -- Validar que todas las categorías tengan una pieza
        IF @piezas_instaladas < @categorias_totales
        BEGIN
            RAISERROR('Debes instalar una pieza de cada categoría antes de finalizar el carro', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Marcar el carro como finalizado
        UPDATE dbo.carro
        SET finalizado = 1
        WHERE id_carro = @id_carro;

        COMMIT TRANSACTION;

        SELECT 'Carro finalizado correctamente' AS mensaje;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END;
GO

-- =============================================
-- SP para obtener el setup de un carro
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_obtener_setup_carro
    @id_carro INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @setup_id INT;

    -- Obtener el setup actual
    SELECT @setup_id = setup_id
    FROM dbo.car_setup
    WHERE car_id = @id_carro AND es_actual = 1;

    IF @setup_id IS NULL
    BEGIN
        -- Devolver estructura vacía
        SELECT 
            NULL AS setup_id,
            NULL AS category_id,
            NULL AS category_name,
            NULL AS part_id,
            NULL AS part_name,
            NULL AS p,
            NULL AS a,
            NULL AS m
        WHERE 1 = 0;
        RETURN;
    END;

    -- Devolver las piezas instaladas
    SELECT 
        csp.setup_id,
        csp.category_id,
        pc.nombre AS category_name,
        csp.part_id,
        p.nombre AS part_name,
        p.p,
        p.a,
        p.m
    FROM dbo.car_setup_pieza csp
    INNER JOIN dbo.part_category pc ON csp.category_id = pc.category_id
    INNER JOIN dbo.pieza p ON csp.part_id = p.id_pieza
    WHERE csp.setup_id = @setup_id
    ORDER BY csp.category_id;
END;
GO

-- =============================================
-- SP para registrar una nueva pieza
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_registrar_pieza
    @nombre NVARCHAR(120),
    @precio DECIMAL(12,2),
    @p TINYINT,
    @a TINYINT,
    @m TINYINT,
    @categoria_id INT,
    @stock_inicial INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @id_pieza INT;

        -- Validar que la categoría existe
        IF NOT EXISTS (SELECT 1 FROM dbo.part_category WHERE category_id = @categoria_id)
        BEGIN
            RAISERROR('La categoría no existe', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- Insertar la pieza
        INSERT INTO dbo.pieza (nombre, precio, p, a, m, categoria_id)
        VALUES (@nombre, @precio, @p, @a, @m, @categoria_id);

        SET @id_pieza = SCOPE_IDENTITY();

        -- Insertar el stock inicial si es mayor a 0
        IF @stock_inicial > 0
        BEGIN
            INSERT INTO dbo.part_stock (part_id, stock_disponible)
            VALUES (@id_pieza, @stock_inicial);
        END;

        COMMIT TRANSACTION;

        -- Retornar la pieza creada
        SELECT 
            id_pieza,
            nombre,
            precio,
            p AS potencia,
            a AS aerodinamica,
            m AS manejabilidad,
            categoria_id,
            @stock_inicial AS stock
        FROM dbo.pieza
        WHERE id_pieza = @id_pieza;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END;
GO