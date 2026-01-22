-- =====================================================================
-- Archivo: cars.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de carros (creación, límites)
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Crear un nuevo carro para un equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_crear_carro
    @id_equipo INT,
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cantidad_carros INT;

    -- Contar carros actuales del equipo
    SELECT @cantidad_carros = COUNT(*)
    FROM dbo.carro
    WHERE id_equipo = @id_equipo;

    -- Validar límite máximo de 2 carros por equipo
    IF @cantidad_carros >= 2
    BEGIN
        RAISERROR('Un equipo no puede tener más de 2 carros', 16, 1);
        RETURN;
    END;

    -- Insertar el nuevo carro
    INSERT INTO dbo.carro (id_equipo, nombre)
    VALUES (@id_equipo, @nombre);

    SELECT 'Carro creado correctamente' AS resultado;
END;
GO