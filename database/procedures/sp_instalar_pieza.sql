CREATE OR ALTER PROCEDURE dbo.sp_instalar_pieza
    @id_carro INT,
    @id_pieza INT,
    @categoria NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @id_equipo INT;
        DECLARE @finalizado BIT;
        DECLARE @cantidad_inventario INT;
        DECLARE @id_pieza_anterior INT;

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
        SELECT @id_pieza_anterior = id_pieza
        FROM dbo.carro_pieza
        WHERE id_carro = @id_carro AND categoria = @categoria;

        -- Si hay una pieza anterior, devolverla al inventario
        IF @id_pieza_anterior IS NOT NULL
        BEGIN
            -- Devolver la pieza anterior al inventario
            UPDATE dbo.inventario_equipo
            SET cantidad = cantidad + 1
            WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza_anterior;

            -- Eliminar la relación anterior
            DELETE FROM dbo.carro_pieza
            WHERE id_carro = @id_carro AND categoria = @categoria;
        END;

        -- Disminuir inventario de la nueva pieza
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad - 1
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        -- Instalar la nueva pieza
        INSERT INTO dbo.carro_pieza (id_carro, id_pieza, categoria)
        VALUES (@id_carro, @id_pieza, @categoria);

        -- Actualizar fecha de última actualización del carro
        UPDATE dbo.carro
        SET ultima_actualizacion = GETDATE()
        WHERE id_carro = @id_carro;

        COMMIT TRANSACTION;

        SELECT 
            'Pieza instalada correctamente' AS mensaje,
            @id_carro AS id_carro,
            @id_pieza AS id_pieza,
            @categoria AS categoria;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO