USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE nombre = N'Scuderia TEC')
    INSERT dbo.equipo(nombre) VALUES (N'Scuderia TEC');

IF NOT EXISTS (SELECT 1 FROM dbo.equipo WHERE nombre = N'Formula Data Racing')
    INSERT dbo.equipo(nombre) VALUES (N'Formula Data Racing');

IF NOT EXISTS (SELECT 1 FROM dbo.patrocinador WHERE nombre = N'TEC Labs')
    INSERT dbo.patrocinador(nombre, email) VALUES (N'TEC Labs', N'sponsor@example.test');

IF NOT EXISTS (SELECT 1 FROM dbo.circuito WHERE nombre = N'Monza Demo')
    INSERT dbo.circuito(nombre, distancia_d, curvas_c) VALUES (N'Monza Demo', 5.793, 11);

DECLARE @parts TABLE(nombre NVARCHAR(120), precio DECIMAL(12,2), p TINYINT, a TINYINT, m TINYINT, categoria NVARCHAR(80), stock INT);
INSERT @parts VALUES
    (N'Power Unit Demo', 500000, 9, 3, 2, N'Unidad de potencia', 10),
    (N'Aero Package Demo', 300000, 2, 9, 3, N'Paquete aerodinámico', 8),
    (N'Soft Tyres Demo', 150000, 1, 4, 9, N'Neumáticos', 15),
    (N'Suspension Demo', 200000, 3, 5, 8, N'Suspensión', 6),
    (N'Gearbox Demo', 180000, 4, 6, 5, N'Caja de cambios', 5);

INSERT dbo.pieza(nombre, precio, p, a, m, categoria_id)
SELECT p.nombre, p.precio, p.p, p.a, p.m, c.category_id
FROM @parts p
JOIN dbo.part_category c ON c.nombre = p.categoria
WHERE NOT EXISTS (SELECT 1 FROM dbo.pieza existing WHERE existing.nombre = p.nombre);

MERGE dbo.part_stock AS target
USING (
    SELECT piece.id_pieza, source.stock
    FROM @parts source
    JOIN dbo.pieza piece ON piece.nombre = source.nombre
) AS source
ON target.part_id = source.id_pieza
WHEN MATCHED THEN UPDATE SET stock_disponible = source.stock, last_update = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT(part_id, stock_disponible) VALUES(source.id_pieza, source.stock);

COMMIT TRANSACTION;
GO
