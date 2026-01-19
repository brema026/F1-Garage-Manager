CREATE OR ALTER PROCEDURE dbo.sp_editar_equipo
    @id_equipo INT,
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo
    )
    BEGIN
        RAISERROR('El equipo no existe', 16, 1);
        RETURN;
    END;

    UPDATE dbo.equipo
    SET nombre = @nombre
    WHERE id_equipo = @id_equipo;

    SELECT 'Equipo actualizado correctamente' AS resultado;
END;
GO