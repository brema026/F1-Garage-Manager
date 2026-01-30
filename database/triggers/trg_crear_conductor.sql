USE f1_garage_tec;
GO

DROP TRIGGER IF EXISTS dbo.trg_crear_conductor;
GO

CREATE TRIGGER dbo.trg_crear_conductor
ON dbo.usuario
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.conductor (id_usuario, id_equipo, nombre, habilidad_h)
    SELECT 
        i.id_usuario,
        ISNULL(i.id_equipo, 0),
        i.nombre,             
        50                    
    FROM inserted i
    WHERE i.rol = 'Driver';
END;
GO
