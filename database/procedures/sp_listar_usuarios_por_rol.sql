USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_listar_usuarios_por_rol', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_listar_usuarios_por_rol;
GO

CREATE PROCEDURE dbo.sp_listar_usuarios_por_rol
    @rol NVARCHAR(50)
AS
BEGIN
    SELECT 
        id_usuario, 
        nombre, 
        email, 
        rol, 
        id_equipo
        
    FROM dbo.usuario
    WHERE LOWER(rol) = LOWER(@rol);
END
GO