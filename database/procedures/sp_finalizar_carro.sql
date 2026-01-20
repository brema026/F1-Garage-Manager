IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_finalizar_carro')
    EXEC sp_executesql N'CREATE PROCEDURE dbo.sp_finalizar_carro AS BEGIN SELECT 1 END'
GO

ALTER PROCEDURE dbo.sp_finalizar_carro
    @id_carro INT,
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @cantidad_categorias INT;
        DECLARE @finalizado BIT;
        DECLARE @setup_id INT;
        DECLARE @carro_finalizado BIT;
        DECLARE @equipo_valido BIT;
        DECLARE @categorias_instaladas NVARCHAR(500);

        -- 1. Validar que el carro existe y pertenece al equipo
        SELECT @carro_finalizado = finalizado, @equipo_valido = CASE WHEN id_equipo = @id_equipo THEN 1 ELSE 0 END
        FROM dbo.carro
        WHERE id_carro = @id_carro;

        IF @carro_finalizado IS NULL
        BEGIN
            RAISERROR('El carro con ID %d no existe en la base de datos', 16, 1, @id_carro);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF @equipo_valido = 0
        BEGIN
            RAISERROR('El carro con ID %d no pertenece al equipo con ID %d', 16, 1, @id_carro, @id_equipo);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 2. Validar que no esté ya finalizado
        IF @carro_finalizado = 1
        BEGIN
            RAISERROR('El carro ya está finalizado y no puede ser modificado', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 3. Obtener setup actual
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        IF @setup_id IS NULL
        BEGIN
            RAISERROR('El carro no tiene ningún setup configurado. Debes instalar las piezas primero', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 4. Contar categorías instaladas
        SELECT @cantidad_categorias = COUNT(DISTINCT category_id)
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id;

        -- 5. Validar que todas las 5 categorías estén instaladas
        IF @cantidad_categorias < 5
        BEGIN
            DECLARE @categorias_faltantes NVARCHAR(MAX) = '';
            DECLARE @cat_id INT;
            DECLARE cat_cursor CURSOR FOR
                SELECT category_id FROM dbo.part_category 
                WHERE category_id NOT IN (
                    SELECT category_id FROM dbo.car_setup_pieza WHERE setup_id = @setup_id
                )
                ORDER BY category_id;
            
            OPEN cat_cursor;
            FETCH NEXT FROM cat_cursor INTO @cat_id;
            
            WHILE @@FETCH_STATUS = 0
            BEGIN
                SELECT @categorias_faltantes = @categorias_faltantes + 
                    CASE 
                        WHEN @categorias_faltantes = '' THEN nombre 
                        ELSE ', ' + nombre 
                    END
                FROM dbo.part_category WHERE category_id = @cat_id;
                
                FETCH NEXT FROM cat_cursor INTO @cat_id;
            END;
            CLOSE cat_cursor;
            DEALLOCATE cat_cursor;
            
            SET @categorias_faltantes = ISNULL(@categorias_faltantes, 'desconocidas');
            RAISERROR('Faltan instalar piezas en las siguientes categorías: %s. El carro debe tener las 5 categorías para ser finalizado', 16, 1, @categorias_faltantes);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 6. Marcar como finalizado
        UPDATE dbo.carro
        SET finalizado = 1
        WHERE id_carro = @id_carro;

        COMMIT TRANSACTION;

        SELECT 
            'Carro finalizado correctamente' AS mensaje,
            @id_carro AS id_carro,
            1 AS finalizado,
            'El carro ahora tiene todas las 5 categorías de piezas instaladas' AS descripcion;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO