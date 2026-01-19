USE f1_garage_tec;
GO

IF OBJECT_ID('dbo.sp_listar_equipos', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_listar_equipos;
GO

CREATE PROCEDURE dbo.sp_listar_equipos
    @id_usuario INT,
    @rol NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        e.id_equipo, 
        e.nombre,
        -- Conteo de conductores para mostrar en las etiquetas de la lista
        (SELECT COUNT(*) FROM dbo.conductor c WHERE c.id_equipo = e.id_equipo) AS total_conductores,
        
        -- Lista detallada de conductores en formato JSON para el mapeo en el frontend
        (SELECT 
            c.id_conductor,
            c.nombre,
            c.habilidad_h
         FROM dbo.conductor c 
         WHERE c.id_equipo = e.id_equipo
         FOR JSON PATH) AS conductores_datos
         
    FROM dbo.equipo e
    LEFT JOIN dbo.usuario u ON e.id_equipo = u.id_equipo
    WHERE 
        (LOWER(@rol) = 'admin') OR (u.id_usuario = @id_usuario)
    GROUP BY e.id_equipo, e.nombre;
END
GO