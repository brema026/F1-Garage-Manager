CREATE OR ALTER PROCEDURE dbo.sp_desinstalar_pieza
    @id_carro INT,
    @categoria NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @id_equipo INT;
        DECLARE @id_pieza INT;
        DECLARE @finalizado BIT;

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

        -- Obtener la pieza instalada en esta categoría
        SELECT @id_pieza = id_pieza
        FROM dbo.carro_pieza
        WHERE id_carro = @id_carro AND categoria = @categoria;

        -- Validar que hay una pieza instalada
        IF @id_pieza IS NULL
        BEGIN
            RAISERROR('No hay ninguna pieza instalada en esta categoría', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Devolver la pieza al inventario
        UPDATE dbo.inventario_equipo
        SET cantidad = cantidad + 1
        WHERE id_equipo = @id_equipo AND id_pieza = @id_pieza;

        -- Si no existe en el inventario, crear el registro
        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO dbo.inventario_equipo (id_equipo, id_pieza, cantidad)
            VALUES (@id_equipo, @id_pieza, 1);
        END;

        -- Eliminar la relación
        DELETE FROM dbo.carro_pieza
        WHERE id_carro = @id_carro AND categoria = @categoria;

        -- Actualizar fecha de última actualización del carro
        UPDATE dbo.carro
        SET ultima_actualizacion = GETDATE()
        WHERE id_carro = @id_carro;

        COMMIT TRANSACTION;

        SELECT 
            'Pieza desinstalada correctamente' AS mensaje,
            @id_carro AS id_carro,
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