CREATE OR ALTER PROCEDURE dbo.sp_conductores_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id_conductor, nombre, habilidad_h
    FROM dbo.conductor
    WHERE id_equipo = @id_equipo;
END;
GO