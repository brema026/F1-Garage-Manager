USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_registrar_usuario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_registrar_usuario;
GO

CREATE PROCEDURE dbo.sp_registrar_usuario
    @nombre NVARCHAR(120),
    @email NVARCHAR(200),
    @password_hash NVARCHAR(255),
    @rol NVARCHAR(20),
    @id_equipo INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- validar si el email ya existe
        IF EXISTS (SELECT 1 FROM dbo.usuario WHERE email = @email)
        BEGIN
            RAISERROR('El correo electrónico ya está registrado.', 16, 1);
        END

        -- validad que el ingeniero tenga un equipo asignado
        IF @rol = 'Engineer' AND @id_equipo IS NULL
        BEGIN
            RAISERROR('Un ingeniero debe estar asociado a un equipo.', 16, 1);
        END

        -- insertar que el usuario
        INSERT INTO dbo.usuario (nombre, email, password_hash, rol, id_equipo, activo)
        VALUES (@nombre, @email, @password_hash, @rol, @id_equipo, 1);

        COMMIT TRANSACTION;
        SELECT SCOPE_IDENTITY() AS id_usuario, 'Usuario registrado exitosamente' AS mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO