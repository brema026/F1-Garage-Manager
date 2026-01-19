-- Stored Procedure: Registro de aportes
-- Autor: Ian Yoel Gómez Oses
-- Descripción:
-- Registra un aporte para un equipo y permite reflejar
-- el presupuesto dinámico mediante la vista vw_presupuesto_equipo

CREATE OR ALTER PROCEDURE sp_registrar_aporte
    @id_equipo INT,
    @id_patrocinador INT,
    @monto DECIMAL(12,2),
    @descripcion VARCHAR(255)
AS
BEGIN
    INSERT INTO aporte (id_equipo, id_patrocinador, monto, fecha, descripcion)
    VALUES (@id_equipo, @id_patrocinador, @monto, GETDATE(), @descripcion);
END;
GO

EXEC sp_registrar_aporte
    @id_equipo = 1,
    @id_patrocinador = 1,
    @monto = 200000,
    @descripcion = 'Aporte usando SP';
