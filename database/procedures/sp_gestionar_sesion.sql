USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_gestionar_sesion', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_gestionar_sesion;
GO

CREATE PROCEDURE dbo.sp_gestionar_sesion
    @id_sesion NVARCHAR(450),
    @id_usuario INT,
    @duracion_minutos INT,
    @datos_json NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Calcular la fecha de expiración sumando la duración al tiempo actual
        DECLARE @expira DATETIME2 = DATEADD(MINUTE, @duracion_minutos, SYSUTCDATETIME());

        -- Verificar si la sesión ya existe y actualizar o insertar según corresponda
        IF EXISTS (SELECT 1 FROM dbo.sesion WHERE id_sesion = @id_sesion)
        BEGIN
            UPDATE dbo.sesion 
            SET expira = @expira, 
                datos_sesion = @datos_json
            WHERE id_sesion = @id_sesion;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.sesion (id_sesion, id_usuario, expira, datos_sesion)
            VALUES (@id_sesion, @id_usuario, @expira, @datos_json);
        END

        -- Eliminar sesiones expiradas
        DELETE FROM dbo.sesion WHERE expira < SYSUTCDATETIME();

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO