IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_finalizar_carro')
    EXEC sp_executesql N'CREATE PROCEDURE dbo.sp_finalizar_carro AS BEGIN SELECT 1 END'
GO

ALTER PROCEDURE dbo.sp_finalizar_carro
    @id_carro INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @cantidad_categorias INT;
        DECLARE @finalizado BIT;
        DECLARE @setup_id INT;

        -- Verificar que el carro existe
        SELECT @finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro;

        IF @finalizado IS NULL
        BEGIN
            RAISERROR('El carro especificado no existe', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Verificar que no esté ya finalizado
        IF @finalizado = 1
        BEGIN
            RAISERROR('El carro ya está finalizado', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Obtener setup actual
        SELECT @setup_id = setup_id
        FROM dbo.car_setup
        WHERE car_id = @id_carro AND es_actual = 1;

        IF @setup_id IS NULL
        BEGIN
            RAISERROR('El carro no tiene ningún setup configurado', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Contar categorías instaladas (debe ser 5)
        SELECT @cantidad_categorias = COUNT(DISTINCT category_id)
        FROM dbo.car_setup_pieza
        WHERE setup_id = @setup_id;

        IF @cantidad_categorias < 5
        BEGIN
            RAISERROR('El carro debe tener las 5 categorías de partes instaladas', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Marcar como finalizado
        UPDATE dbo.carro
        SET finalizado = 1
        WHERE id_carro = @id_carro;

        COMMIT TRANSACTION;

        SELECT 
            'Carro finalizado correctamente' AS mensaje,
            @id_carro AS id_carro,
            1 AS finalizado;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO