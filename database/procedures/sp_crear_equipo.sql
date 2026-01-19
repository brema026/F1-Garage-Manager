CREATE OR ALTER PROCEDURE dbo.sp_crear_equipo
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM dbo.equipo WHERE nombre = @nombre
    )
    BEGIN
        RAISERROR('Ya existe un equipo con ese nombre', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.equipo (nombre)
    VALUES (@nombre);

    SELECT 'Equipo creado correctamente' AS resultado;
END;
GO