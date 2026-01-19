USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_validar_login', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_validar_login;
GO

CREATE PROCEDURE dbo.sp_validar_login
    @email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id_usuario, 
        nombre, 
        password_hash, 
        rol, 
        id_equipo 
    FROM dbo.usuario 
    WHERE email = @email AND activo = 1;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Usuario no encontrado o inactivo.', 16, 1);
    END
END;
GO