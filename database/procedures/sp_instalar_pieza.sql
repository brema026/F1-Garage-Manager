USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_instalar_pieza_setup
    @id_carro INT,
    @id_pieza INT,
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Variables
        DECLARE @setup_id INT;
        DECLARE @category_id INT;
        DECLARE @cantidad_inventario INT;
        DECLARE @carro_finalizado BIT;
        DECLARE @pieza_instalada INT;
        DECLARE @pieza_nombre NVARCHAR(120);
        DECLARE @error_msg NVARCHAR(500);
        DECLARE @equipo_valido BIT;

        -- 1. Validar que el carro existe y pertenece al equipo
        SELECT @carro_finalizado = finalizado, @equipo_valido = CASE WHEN id_equipo = @id_equipo THEN 1 ELSE 0 END
        FROM dbo.carro
        WHERE id_carro = @id_carro;

        IF @carro_finalizado IS NULL
        BEGIN
            SET @error_msg = 'El carro con ID ' + CAST(@id_carro AS NVARCHAR(10)) + ' no existe en la base de datos';
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF @equipo_valido = 0
        BEGIN
            SET @error_msg = 'El carro con ID ' + CAST(@id_carro AS NVARCHAR(10)) + ' no pertenece al equipo con ID ' + CAST(@id_equipo AS NVARCHAR(10));
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 2. Validar que el carro no esté finalizado
        IF @carro_finalizado = 1
        BEGIN
            RAISERROR('No puedes modificar un carro finalizado. El carro ya está en estado final', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 3. Obtener la categoría y nombre de la pieza
        SELECT 
            @category_id = categoria_id,
            @pieza_nombre = nombre
        FROM dbo.pieza
        WHERE id_pieza = @id_pieza;

        IF @category_id IS NULL
        BEGIN
            SET @error_msg = 'La pieza con ID ' + CAST(@id_pieza AS NVARCHAR(10)) + ' no existe en la base de datos o no está disponible';
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 4. Verificar que el equipo tenga la pieza en inventario
        SELECT @cantidad_inventario = cantidad
        FROM dbo.inventario_equipo
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        IF @cantidad_inventario IS NULL OR @cantidad_inventario <= 0
        BEGIN
            SET @error_msg = 'No tienes disponibilidad de la pieza "' + ISNULL(@pieza_nombre, 'desconocida') + '" en el inventario del equipo';
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 5. Obtener el setup actual del carro
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        -- Si no existe un setup actual, crear uno nuevo
        IF @setup_id IS NULL
        BEGIN
            INSERT INTO dbo.car_setup (car_id, es_actual)
            VALUES (@id_carro, 1);
            
            SET @setup_id = SCOPE_IDENTITY();
        END;

        -- 6. Verificar si ya hay una pieza instalada en esta categoría
        SELECT @pieza_instalada = part_id
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id AND category_id = @category_id;

        -- 7. Si hay una pieza instalada, devolverla al inventario
        IF @pieza_instalada IS NOT NULL
        BEGIN
            -- Devolver la pieza anterior al inventario
            UPDATE dbo.inventario_equipo
            SET cantidad = cantidad + 1,
                last_update = SYSUTCDATETIME()
            WHERE id_equipo = @id_equipo AND id_pieza = @pieza_instalada;

            -- Si no existe en el inventario, crear el registro
            IF @@ROWCOUNT = 0
            BEGIN
                INSERT INTO dbo.inventario_equipo (id_equipo, id_pieza, cantidad)
                VALUES (@id_equipo, @pieza_instalada, 1);
            END;

            -- Eliminar la pieza del setup
            DELETE FROM dbo.car_setup_pieza
            WHERE setup_id = @setup_id AND category_id = @category_id;
        END;

        -- 8. Instalar la nueva pieza
        INSERT INTO dbo.car_setup_pieza (setup_id, category_id, part_id)
        VALUES (@setup_id, @category_id, @id_pieza);

        -- 9. Reducir el inventario
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad - 1,
            last_update = SYSUTCDATETIME()
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        COMMIT TRANSACTION;

        -- Retornar información del setup actualizado
        SELECT 
            @setup_id AS setup_id,
            @id_carro AS id_carro,
            @category_id AS category_id,
            @id_pieza AS part_id,
            @pieza_nombre AS part_name,
            'Pieza "' + @pieza_nombre + '" instalada correctamente' AS mensaje;

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