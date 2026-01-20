CREATE OR ALTER PROCEDURE dbo.sp_instalar_pieza
    @id_carro INT,
    @id_pieza INT,
    @categoria_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @id_equipo INT;
        DECLARE @finalizado BIT;
        DECLARE @cantidad_inventario INT;
        DECLARE @setup_id INT;
        DECLARE @categoria_existente INT;

        -- Obtener información del carro
        SELECT @id_equipo = id_equipo, @finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro;

        -- Validar que el carro existe
        IF @id_equipo IS NULL
        BEGIN
            RAISERROR('El carro especificado no existe', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Validar que el carro no esté finalizado
        IF @finalizado = 1
        BEGIN
            RAISERROR('No se puede modificar un carro finalizado', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Obtener o crear setup actual
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        IF @setup_id IS NULL
        BEGIN
            INSERT INTO dbo.car_setup (car_id, es_actual)
            VALUES (@id_carro, 1);
            SET @setup_id = SCOPE_IDENTITY();
        END;

        -- Verificar que la pieza existe en el inventario del equipo
        SELECT @cantidad_inventario = cantidad
        FROM dbo.inventario_equipo
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        IF @cantidad_inventario IS NULL OR @cantidad_inventario < 1
        BEGIN
            RAISERROR('No hay suficiente inventario de esta pieza', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Verificar si ya hay una pieza instalada en esta categoría
        SELECT @categoria_existente = part_id
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id AND category_id = @categoria_id;

        -- Si hay una pieza anterior, devolverla al inventario
        IF @categoria_existente IS NOT NULL
        BEGIN
            -- Devolver la pieza anterior al inventario
            UPDATE dbo.inventario_equipo
            SET cantidad = cantidad + 1
            WHERE id_equipo = @id_equipo AND id_pieza = @categoria_existente;

            -- Eliminar la relación anterior
            DELETE FROM dbo.car_setup_pieza
            WHERE setup_id = @setup_id AND category_id = @categoria_id;
        END;

        -- Disminuir inventario de la nueva pieza
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad - 1, last_update = SYSUTCDATETIME()
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        -- Instalar la nueva pieza
        INSERT INTO dbo.car_setup_pieza (setup_id, category_id, part_id)
        VALUES (@setup_id, @categoria_id, @id_pieza);

        COMMIT TRANSACTION;

        SELECT 
            'Pieza instalada correctamente' AS mensaje,
            @id_carro AS id_carro,
            @id_pieza AS id_pieza,
            @categoria_id AS categoria_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO