-- Inserts Dummy para verificacion de tablas.

USE f1_garage_tec;
GO

-- LIMPIAR DATOS EXISTENTES (En orden de relaciones FK)
DELETE FROM resultado_simulacion;
DELETE FROM simulacion;
DELETE FROM car_setup_pieza;
DELETE FROM car_setup;
DELETE FROM carro;
DELETE FROM circuito;
DELETE FROM inventario_equipo;
DELETE FROM conductor;
DELETE FROM usuario;
DELETE FROM equipo;
DELETE FROM part_stock;
DELETE FROM pieza;
DELETE FROM part_category;

-- RESEED IDENTITY para todas las tablas
DBCC CHECKIDENT ('part_category', RESEED, 0);
DBCC CHECKIDENT ('pieza', RESEED, 0);
DBCC CHECKIDENT ('equipo', RESEED, 0);
DBCC CHECKIDENT ('usuario', RESEED, 0);
DBCC CHECKIDENT ('conductor', RESEED, 0);
DBCC CHECKIDENT ('carro', RESEED, 0);
DBCC CHECKIDENT ('car_setup', RESEED, 0);
DBCC CHECKIDENT ('circuito', RESEED, 0);
DBCC CHECKIDENT ('simulacion', RESEED, 0);
DBCC CHECKIDENT ('resultado_simulacion', RESEED, 0);

-- BLOQUE 1 
INSERT INTO part_category (nombre) VALUES
('Unidad de potencia'),
('Paquete aerodinámico'),
('Neumáticos'),
('Suspensión'),
('Caja de cambios');

SELECT * FROM part_category;

-- BLOQUE 2 – PIEZAS
INSERT INTO pieza (nombre, precio, p, a, m, categoria_id) VALUES
('Motor Ferrari F1', 500000, 9, 3, 2, 1),
('Aero RedBull', 300000, 2, 9, 3, 2),
('Pirelli Soft', 150000, 1, 4, 9, 3),
('Suspensión Mercedes', 200000, 3, 5, 8, 4),
('Gearbox ZF', 180000, 4, 6, 5, 5);

SELECT id_pieza, nombre, categoria_id FROM pieza;

-- BLOQUE 3: PART STOCK
INSERT INTO part_stock (part_id, stock_disponible) VALUES
(1, 100),
(2, 100),
(3, 100),
(4, 100),
(5, 100);

SELECT * FROM part_stock;

-- BLOQUE 4: EQUIPO
INSERT INTO equipo (nombre)
VALUES ('Scuderia TEC');

SELECT * FROM equipo;

-- BLOQUE 5: USUARIO (ENGINEER)
INSERT INTO usuario (nombre, email, password_hash, rol, id_equipo)
VALUES ('Ian Gómez', 'ian@tec.cr', 'HASH_DUMMY', 'Engineer', 1);

SELECT id_usuario, nombre, rol, id_equipo FROM usuario;

-- BLOQUE 6: CONDUCTOR
INSERT INTO conductor (id_equipo, nombre, habilidad_h)
VALUES 
(1, 'Ian Racer', 85),
(1, 'Carlos Sainz', 88),
(1, 'Charles Leclerc', 90),
(1, 'Lewis Hamilton', 92);

SELECT * FROM conductor;

-- BLOQUE 7: CARRO
INSERT INTO carro (id_equipo, nombre)
VALUES 
(1, 'TEC-01'),
(1, 'TEC-02'),
(1, 'TEC-03'),
(1, 'TEC-04');

SELECT * FROM carro;

-- BLOQUE 8: CAR SETUP
INSERT INTO car_setup (car_id, es_actual)
VALUES 
(1, 1),
(2, 1),
(3, 1),
(4, 1);

SELECT * FROM car_setup;

-- BLOQUE 9: CAR SETUP - PIEZAS (ARMADO)
INSERT INTO car_setup_pieza (setup_id, category_id, part_id) VALUES
(1, 1, 1), -- Unidad de potencia
(1, 2, 2), -- Paquete aerodinámico
(1, 3, 3), -- Neumáticos
(1, 4, 4), -- Suspensión
(1, 5, 5), -- Caja de cambios
(2, 1, 1), -- Unidad de potencia
(2, 2, 2), -- Paquete aerodinámico
(2, 3, 3), -- Neumáticos
(2, 4, 4), -- Suspensión
(2, 5, 5), -- Caja de cambios
(3, 1, 1), -- Unidad de potencia
(3, 2, 2), -- Paquete aerodinámico
(3, 3, 3), -- Neumáticos
(3, 4, 4), -- Suspensión
(3, 5, 5), -- Caja de cambios
(4, 1, 1), -- Unidad de potencia
(4, 2, 2), -- Paquete aerodinámico
(4, 3, 3), -- Neumáticos
(4, 4, 4), -- Suspensión
(4, 5, 5); -- Caja de cambios

SELECT * FROM car_setup_pieza;

-- BLOQUE 9.5: INVENTARIO EQUIPO (Asignar piezas al equipo)
INSERT INTO inventario_equipo (id_equipo, id_pieza, cantidad) VALUES
(1, 1, 20),  -- Motor Ferrari F1
(1, 2, 20),  -- Aero RedBull
(1, 3, 20),  -- Pirelli Soft
(1, 4, 20),  -- Suspensión Mercedes
(1, 5, 20);  -- Gearbox ZF

SELECT * FROM inventario_equipo;

-- BLOQUE 10: CIRCUITO
INSERT INTO circuito (nombre, distancia_d, curvas_c)
VALUES ('Monza', 5.793, 11);

SELECT * FROM circuito;

-- BLOQUE 11: SIMULACION
INSERT INTO simulacion (id_circuito, id_usuario)
VALUES (1, 1);

SELECT * FROM simulacion;

-- BLOQUE 12: RESULTADO SIMULACION
INSERT INTO resultado_simulacion
(id_simulacion, id_carro, setup_id, posicion, vrecta, vcurva, penalizacion, tiempo_segundos)
VALUES
(1, 1, 1, 1, 330.5, 145.2, 520.0, 4821.3);


SELECT * FROM resultado_simulacion;
