USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_carros_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id_carro, nombre, finalizado
    FROM dbo.carro
    WHERE id_equipo = @id_equipo;
END;
GO