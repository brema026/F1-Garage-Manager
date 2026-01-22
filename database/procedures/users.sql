-- =====================================================================
-- Archivo: users.sql
-- Base de datos: f1_garage_tec
-- Descripción: Procedimientos para gestión de usuarios, autenticación,
--              sesiones y asignación de equipos
-- =====================================================================
USE f1_garage_tec;
GO

-- =========================================
-- Asignar equipo a usuario o conductor
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_asignar_equipo_usuario
    @id_usuario INT = NULL,
    @id_equipo INT,
    @id_conductor INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Caso 1: Driver con cuenta de usuario vinculada
    IF @id_usuario IS NOT NULL AND @id_usuario > 0
    BEGIN
        -- Actualizar tabla usuarios
        UPDATE dbo.usuario 
        SET id_equipo = @id_equipo
        WHERE id_usuario = @id_usuario;

        -- Actualizar tabla conductores por integridad
        UPDATE dbo.conductor
        SET id_equipo = @id_equipo
        WHERE id_usuario = @id_usuario;
    END
    -- Caso 2: Driver creado manualmente sin cuenta
    ELSE IF @id_conductor IS NOT NULL
    BEGIN
        UPDATE dbo.conductor
        SET id_equipo = @id_equipo
        WHERE id_conductor = @id_conductor;
    END
END;
GO

-- =========================================
-- Cerrar sesión de usuario
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_cerrar_sesion
    @id_sesion NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Eliminar sesión activa
    DELETE FROM dbo.sesion 
    WHERE id_sesion = @id_sesion;
END;
GO

-- =========================================
-- Crear o actualizar sesión de usuario
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_gestionar_sesion
    @id_sesion NVARCHAR(450),
    @id_usuario INT,
    @duracion_minutos INT,
    @datos_json NVARCHAR(MAX) = NULL 
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Calcular fecha de expiración
        DECLARE @expira DATETIME2 = DATEADD(MINUTE, @duracion_minutos, SYSUTCDATETIME());

        -- Actualizar si existe, insertar si no
        IF EXISTS (SELECT 1 FROM dbo.sesion WHERE id_sesion = @id_sesion)
        BEGIN
            UPDATE dbo.sesion 
            SET expira = @expira, 
                datos_sesion = @datos_json
            WHERE id_sesion = @id_sesion;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.sesion (id_sesion, id_usuario, expira, datos_sesion)
            VALUES (@id_sesion, @id_usuario, @expira, @datos_json);
        END

        -- Limpiar sesiones expiradas
        DELETE FROM dbo.sesion WHERE expira < SYSUTCDATETIME();

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- =========================================
-- Listar usuarios filtrados por rol
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_listar_usuarios_por_rol
    @rol NVARCHAR(50)
AS
BEGIN
    SELECT 
        id_usuario, 
        nombre, 
        email, 
        rol, 
        id_equipo
    FROM dbo.usuario
    WHERE LOWER(rol) = LOWER(@rol);
END;
GO

-- =========================================
-- Registrar nuevo usuario en el sistema
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_registrar_usuario
    @nombre NVARCHAR(120),
    @email NVARCHAR(200),
    @password_hash NVARCHAR(255),
    @rol NVARCHAR(20),
    @id_equipo INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar email único
        IF EXISTS (SELECT 1 FROM dbo.usuario WHERE email = @email)
        BEGIN
            RAISERROR('El correo electrónico ya está registrado.', 16, 1);
        END

        -- Validar que Engineer tenga equipo asignado
        IF @rol = 'Engineer' AND @id_equipo IS NULL
        BEGIN
            RAISERROR('Un ingeniero debe estar asociado a un equipo.', 16, 1);
        END

        -- Insertar usuario
        INSERT INTO dbo.usuario (nombre, email, password_hash, rol, id_equipo, activo)
        VALUES (@nombre, @email, @password_hash, @rol, @id_equipo, 1);

        COMMIT TRANSACTION;
        SELECT SCOPE_IDENTITY() AS id_usuario, 'Usuario registrado exitosamente' AS mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =========================================
-- Validar credenciales de login
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_validar_login
    @email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    -- Obtener datos del usuario activo
    SELECT 
        id_usuario, 
        nombre, 
        password_hash, 
        rol, 
        id_equipo 
    FROM dbo.usuario 
    WHERE email = @email AND activo = 1;

    -- Validar si existe
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Usuario no encontrado o inactivo.', 16, 1);
    END
END;
GO

-- =========================================
-- Obtener perfil detallado de usuario
-- =========================================
CREATE OR ALTER PROCEDURE dbo.sp_obtener_perfil_detallado
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Datos de usuario con equipo y conductor si aplica
    SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.rol,
        u.id_equipo,
        ISNULL(e.nombre, 'Sin Equipo') AS nombre_equipo,
        c.id_conductor,
        c.habilidad_h AS habilidad
    FROM dbo.usuario u
    LEFT JOIN dbo.equipo e ON u.id_equipo = e.id_equipo
    LEFT JOIN dbo.conductor c ON u.id_usuario = c.id_usuario
    WHERE u.id_usuario = @id_usuario;
END;
GO