CREATE OR ALTER PROCEDURE dbo.sp_asignar_conductor
    @id_carro INT,
    @id_conductor INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @id_equipo_carro INT;
        DECLARE @id_equipo_conductor INT;
        DECLARE @finalizado BIT;

        -- Obtener equipo del carro
        SELECT @id_equipo_carro = id_equipo, @finalizado = finalizado
        FROM dbo.carro
        WHERE id_carro = @id_carro;

        -- Validar que el carro existe
        IF @id_equipo_carro IS NULL
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

        -- Obtener equipo del conductor
        SELECT @id_equipo_conductor = id_equipo
        FROM dbo.conductor
        WHERE id_conductor = @id_conductor;

        -- Validar que el conductor existe
        IF @id_equipo_conductor IS NULL
        BEGIN
            RAISERROR('El conductor especificado no existe', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Validar que el conductor pertenece al mismo equipo
        IF @id_equipo_carro != @id_equipo_conductor
        BEGIN
            RAISERROR('El conductor debe pertenecer al mismo equipo del carro', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Asignar conductor al setup actual
        UPDATE dbo.car_setup
        SET id_conductor = @id_conductor
        WHERE car_id = @id_carro AND es_actual = 1;

        COMMIT TRANSACTION;

        SELECT 
            'Conductor asignado correctamente' AS mensaje,
            @id_carro AS id_carro,
            @id_conductor AS id_conductor;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO