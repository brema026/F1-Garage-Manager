IF NOT EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_crear_carro')
    EXEC sp_executesql N'CREATE PROCEDURE dbo.sp_crear_carro AS BEGIN SELECT 1 END'
GO

ALTER PROCEDURE dbo.sp_crear_carro
    @id_equipo INT,
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cantidad_carros INT;

    SELECT @cantidad_carros = COUNT(*)
    FROM dbo.carro
    WHERE id_equipo = @id_equipo;

    IF @cantidad_carros >= 2
    BEGIN
        RAISERROR('Un equipo no puede tener m�s de 2 carros', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.carro (id_equipo, nombre)
    VALUES (@id_equipo, @nombre);

    DECLARE @id_carro INT = SCOPE_IDENTITY();

    SELECT 
        @id_carro AS id_carro,
        'Carro creado correctamente' AS resultado,
        @id_equipo AS id_equipo,
        @nombre AS nombre,
        0 AS finalizado;
END;
GO