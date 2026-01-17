USE f1_garage_tec;
GO

-- Drop para sp_asignar_equipo_usuario
IF OBJECT_ID('dbo.sp_asignar_equipo_usuario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_asignar_equipo_usuario;
GO


CREATE PROCEDURE dbo.sp_asignar_equipo_usuario
    @id_usuario INT,
    @id_equipo INT
AS
BEGIN
    UPDATE dbo.usuario 
    SET id_equipo = @id_equipo
    WHERE id_usuario = @id_usuario;
END
GO