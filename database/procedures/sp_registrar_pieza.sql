USE f1_garage_tec;
GO

CREATE OR ALTER PROCEDURE dbo.sp_registrar_pieza
    @nombre         NVARCHAR(120),
    @precio         DECIMAL(12,2),
    @p              TINYINT,
    @a              TINYINT,
    @m              TINYINT,
    @categoria_id   INT,
    @stock_inicial  INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    -- Validar categoría
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.part_category
        WHERE category_id = @categoria_id
    )
    BEGIN
        RAISERROR('La categoría no existe', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Insertar pieza
    INSERT INTO dbo.pieza (nombre, precio, p, a, m, categoria_id)
    VALUES (@nombre, @precio, @p, @a, @m, @categoria_id);

    DECLARE @id_pieza INT;
    SET @id_pieza = SCOPE_IDENTITY();

    -- Insertar stock inicial
    INSERT INTO dbo.part_stock (part_id, stock_disponible)
    VALUES (@id_pieza, @stock_inicial);

    COMMIT TRANSACTION;

    SELECT 
        'Pieza registrada correctamente' AS resultado,
        @id_pieza AS id_pieza;
END;
GO
