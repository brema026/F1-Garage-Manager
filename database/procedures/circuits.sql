-- =====================================================================
-- Archivo: circuits.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para la creación, eliminacion, etc... de circuitos
-- =====================================================================
USE f1_garage_tec;
GO

-- =============================================
-- SP: Listar circuitos (con permisos por rol)
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_circuitos
    @id_usuario INT,
    @rol NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Admin ve todos los circuitos, otros también pueden ver (para seleccionar en simulación)
    SELECT 
        id_circuito,
        nombre,
        distancia_d,
        curvas_c,
        -- Contar simulaciones asociadas (para validar eliminación)
        (SELECT COUNT(*) FROM dbo.simulacion WHERE id_circuito = c.id_circuito) AS total_simulaciones
    FROM dbo.circuito c
    ORDER BY nombre;
END
GO

-- =============================================
-- SP: Obtener circuito por ID
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_obtener_circuito
    @id_circuito INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id_circuito,
        nombre,
        distancia_d,
        curvas_c
    FROM dbo.circuito
    WHERE id_circuito = @id_circuito;
    
    IF @@ROWCOUNT = 0
        RAISERROR('Circuito no encontrado', 16, 1);
END
GO

-- =============================================
-- SP: Crear nuevo circuito
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_crear_circuito
    @nombre NVARCHAR(120),
    @distancia_d DECIMAL(10,3),
    @curvas_c INT,
    @id_usuario INT  -- Para auditoría
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar datos
        IF @nombre IS NULL OR LTRIM(RTRIM(@nombre)) = ''
            RAISERROR('El nombre del circuito es requerido', 16, 1);
        
        IF @distancia_d <= 0
            RAISERROR('La distancia debe ser mayor a 0', 16, 1);
        
        IF @curvas_c < 0
            RAISERROR('El número de curvas no puede ser negativo', 16, 1);
        
        -- Verificar nombre único
        IF EXISTS (SELECT 1 FROM dbo.circuito WHERE nombre = @nombre)
            RAISERROR('Ya existe un circuito con ese nombre', 16, 1);
        
        -- Insertar circuito
        INSERT INTO dbo.circuito (nombre, distancia_d, curvas_c)
        OUTPUT INSERTED.*
        VALUES (@nombre, @distancia_d, @curvas_c);
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- =============================================
-- SP: Eliminar circuito
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_circuito
    @id_circuito INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @existe_simulacion INT;
    
    -- Verificar si el circuito existe
    IF NOT EXISTS (SELECT 1 FROM dbo.circuito WHERE id_circuito = @id_circuito)
    BEGIN
        RAISERROR('Circuito no encontrado', 16, 1);
        RETURN;
    END
    
    -- Verificar si hay simulaciones asociadas
    SELECT @existe_simulacion = COUNT(*)
    FROM dbo.simulacion 
    WHERE id_circuito = @id_circuito;
    
    IF @existe_simulacion > 0
    BEGIN
        RAISERROR('No se puede eliminar el circuito porque tiene %d simulaciones asociadas', 16, 1, @existe_simulacion);
        RETURN;
    END
    
    -- Eliminar circuito
    DELETE FROM dbo.circuito
    WHERE id_circuito = @id_circuito;
    
    SELECT 'Circuito eliminado correctamente' AS mensaje;
END
GO