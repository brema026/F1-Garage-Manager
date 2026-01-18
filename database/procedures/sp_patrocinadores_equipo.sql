CREATE OR ALTER PROCEDURE dbo.sp_patrocinadores_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.id_patrocinador,
        p.nombre,
        a.monto,
        a.fecha
    FROM dbo.aporte a
    JOIN dbo.patrocinador p ON p.id_patrocinador = a.id_patrocinador
    WHERE a.id_equipo = @id_equipo;
END;
GO
