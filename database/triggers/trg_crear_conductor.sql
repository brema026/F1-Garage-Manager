USE f1_garage_tec;
GO

-- Este trogger crea un registro en la tabla 'conductor' cada vez que un usuario con rol 'Driver' es insertado en la tabla 'usuario'.
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