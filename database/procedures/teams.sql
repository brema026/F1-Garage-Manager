-- =====================================================================
-- Archivo: teams.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de equipos, carros y
--              conductores asociados a cada equipo
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Listar carros de un equipo
-- =========================================
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

-- =========================================
-- Listar conductores de un equipo
-- =========================================
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

-- =========================================
-- Crear un nuevo equipo
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_crear_equipo
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar nombre único
    IF EXISTS (
        SELECT 1 FROM dbo.equipo WHERE nombre = @nombre
    )
    BEGIN
        RAISERROR('Ya existe un equipo con ese nombre', 16, 1);
        RETURN;
    END;

    -- Insertar equipo
    INSERT INTO dbo.equipo (nombre)
    VALUES (@nombre);

    SELECT 'Equipo creado correctamente' AS resultado;
END;
GO

-- =========================================
-- Editar nombre de un equipo existente
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_editar_equipo
    @id_equipo INT,
    @nombre NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar que el equipo exista
    IF NOT EXISTS (
        SELECT 1 FROM dbo.equipo WHERE id_equipo = @id_equipo
    )
    BEGIN
        RAISERROR('El equipo no existe', 16, 1);
        RETURN;
    END;

    -- Actualizar nombre
    UPDATE dbo.equipo
    SET nombre = @nombre
    WHERE id_equipo = @id_equipo;

    SELECT 'Equipo actualizado correctamente' AS resultado;
END;
GO

-- =========================================
-- Listar equipos según rol del usuario (con finanzas + patrocinadores únicos)
-- Devuelve:
--   - conductores_datos (JSON)
--   - presupuesto_total, gasto_total, saldo_disponible
--   - patrocinadores_datos (JSON)  -> patrocinadores únicos con total_aportado y ultimo_aporte
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_equipos
    @id_usuario INT,
    @rol NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        e.id_equipo, 
        e.nombre,

        -- Conteo de conductores del equipo
        (SELECT COUNT(*) 
         FROM dbo.conductor c 
         WHERE c.id_equipo = e.id_equipo) AS total_conductores,

        -- Conductores en formato JSON para el frontend
        (SELECT 
            c.id_conductor,
            c.nombre,
            c.habilidad_h
         FROM dbo.conductor c 
         WHERE c.id_equipo = e.id_equipo
         FOR JSON PATH) AS conductores_datos,

        -- ========= FINANZAS =========
        -- Total aportado al equipo
        CAST(ISNULL((
            SELECT SUM(a.monto)
            FROM dbo.aporte a
            WHERE a.id_equipo = e.id_equipo
        ), 0) AS DECIMAL(12,2)) AS presupuesto_total,

        -- Total gastado por compras del equipo
        CAST(ISNULL((
            SELECT SUM(ce.total)
            FROM dbo.compra_equipo ce
            WHERE ce.id_equipo = e.id_equipo
        ), 0) AS DECIMAL(12,2)) AS gasto_total,

        -- Saldo disponible = aportes - compras
        CAST(
            ISNULL((
                SELECT SUM(a.monto)
                FROM dbo.aporte a
                WHERE a.id_equipo = e.id_equipo
            ), 0)
            -
            ISNULL((
                SELECT SUM(ce.total)
                FROM dbo.compra_equipo ce
                WHERE ce.id_equipo = e.id_equipo
            ), 0)
        AS DECIMAL(12,2)) AS saldo_disponible,

        -- ========= PATROCINADORES (ÚNICOS) =========
        -- Lista única de patrocinadores que han aportado a este equipo (con métricas)
        (SELECT
            p.id_patrocinador,
            p.nombre,
            p.email,
            CAST(SUM(a.monto) AS DECIMAL(12,2)) AS total_aportado,
            MAX(a.fecha) AS ultimo_aporte
         FROM dbo.aporte a
         INNER JOIN dbo.patrocinador p
            ON p.id_patrocinador = a.id_patrocinador
         WHERE a.id_equipo = e.id_equipo
         GROUP BY p.id_patrocinador, p.nombre, p.email
         ORDER BY SUM(a.monto) DESC
         FOR JSON PATH) AS patrocinadores_datos

    FROM dbo.equipo e
    LEFT JOIN dbo.usuario u ON e.id_equipo = u.id_equipo
    WHERE 
        -- Admin ve todos, otros solo su equipo
        (LOWER(@rol) = 'admin') OR (u.id_usuario = @id_usuario)
    GROUP BY 
        e.id_equipo, 
        e.nombre;
END;
GO

