USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_asignar_equipo_usuario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_asignar_equipo_usuario;
GO

CREATE PROCEDURE dbo.sp_asignar_equipo_usuario
    @id_usuario INT = NULL,
    @id_equipo INT,
    @id_conductor INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Caso 1: El driver tiene una cuenta de usuario vinculada
    IF @id_usuario IS NOT NULL AND @id_usuario > 0
    BEGIN
        -- Actualizamos la tabla de usuarios
        UPDATE dbo.usuario 
        SET id_equipo = @id_equipo
        WHERE id_usuario = @id_usuario;

        -- Actualizamos la tabla de conductores (por integridad)
        UPDATE dbo.conductor
        SET id_equipo = @id_equipo
        WHERE id_usuario = @id_usuario;
    END
    -- Caso 2: El driver fue creado manualmente (no tiene id_usuario)
    ELSE IF @id_conductor IS NOT NULL
    BEGIN
        UPDATE dbo.conductor
        SET id_equipo = @id_equipo
        WHERE id_conductor = @id_conductor;
    END
END
GO