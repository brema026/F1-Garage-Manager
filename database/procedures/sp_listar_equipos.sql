CREATE PROCEDURE dbo.sp_listar_equipos
    @id_usuario INT,
    @rol NVARCHAR(50)
AS
BEGIN
    IF @rol = 'admin'
    BEGIN
        SELECT id_equipo, nombre 
        FROM dbo.equipo;
    END
    ELSE
    BEGIN
        SELECT e.id_equipo, e.nombre 
        FROM dbo.equipo e
        JOIN dbo.usuario u ON e.id_equipo = u.id_equipo
        WHERE u.id_usuario = @id_usuario;
    END
END