-- Migración 001: Agregar columna id_conductor a car_setup
-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'car_setup' AND COLUMN_NAME = 'id_conductor'
)
BEGIN
    ALTER TABLE dbo.car_setup
    ADD id_conductor INT NULL;

    -- Agregar constraint de FK
    ALTER TABLE dbo.car_setup
    ADD CONSTRAINT fk_car_setup_conductor FOREIGN KEY (id_conductor) 
    REFERENCES dbo.conductor(id_conductor);

    PRINT 'Se agregó la columna id_conductor a la tabla car_setup';
END
ELSE
BEGIN
    PRINT 'La columna id_conductor ya existe en la tabla car_setup';
END;
GO
