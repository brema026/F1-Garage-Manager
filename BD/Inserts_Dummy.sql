-- Inserts Dummy para verificacion de tablas.

USE f1_garage_tec;
GO

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
('PU Ferrari', 500000, 9, 3, 2, 1),
('Aero RedBull', 300000, 2, 9, 3, 2),
('Pirelli Soft', 150000, 1, 4, 9, 3),
('Suspensión Mercedes', 200000, 3, 5, 8, 4),
('Gearbox ZF', 180000, 4, 6, 5, 5);

SELECT id_pieza, nombre, categoria_id FROM pieza;

-- BLOQUE 3: PART STOCK
INSERT INTO part_stock (part_id, stock_disponible) VALUES
(1, 10),
(2, 8),
(3, 15),
(4, 6),
(5, 5);

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
VALUES (1, 'Ian Racer', 85);

SELECT * FROM conductor;

-- BLOQUE 7: CARRO
INSERT INTO carro (id_equipo, nombre)
VALUES (1, 'TEC-01');

SELECT * FROM carro;

-- BLOQUE 8: CAR SETUP
INSERT INTO car_setup (car_id, es_actual)
VALUES (1, 1);

SELECT * FROM car_setup;

-- BLOQUE 9: CAR SETUP - PIEZAS (ARMADO)
INSERT INTO car_setup_pieza (setup_id, category_id, part_id) VALUES
(1, 1, 1), -- Unidad de potencia
(1, 2, 2), -- Paquete aerodinámico
(1, 3, 3), -- Neumáticos
(1, 4, 4), -- Suspensión
(1, 5, 5); -- Caja de cambios

SELECT * FROM car_setup_pieza;

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
