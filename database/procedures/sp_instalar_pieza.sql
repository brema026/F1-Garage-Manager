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

        -- 1. Validar que el carro existe y pertenece al equipo
        SELECT @carro_finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro AND id_equipo = @id_equipo;

        IF @carro_finalizado IS NULL
        BEGIN
            RAISERROR('El carro no existe o no pertenece a este equipo', 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- 2. Validar que el carro no esté finalizado
        IF @carro_finalizado = 1
        BEGIN
            RAISERROR('No puedes modificar un carro finalizado', 16, 1);
            ROLLBACK;
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
            DECLARE @error_msg NVARCHAR(200);
            SET @error_msg = 'La pieza con ID ' + CAST(@id_pieza AS NVARCHAR(10)) + ' no existe en la base de datos';
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK;
            RETURN;
        END;

        -- 4. Verificar que el equipo tenga la pieza en inventario
        SELECT @cantidad_inventario = cantidad
        FROM dbo.inventario_equipo
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        IF @cantidad_inventario IS NULL OR @cantidad_inventario <= 0
        BEGIN
            SET @error_msg = 'No tienes la pieza "' + @pieza_nombre + '" en el inventario del equipo';
            RAISERROR(@error_msg, 16, 1);
            ROLLBACK;
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
            'Pieza instalada correctamente' AS mensaje;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END;
GO