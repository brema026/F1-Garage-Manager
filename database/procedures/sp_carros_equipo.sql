CREATE OR ALTER PROCEDURE dbo.sp_carros_equipo
    @id_equipo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        c.id_carro,
        c.id_equipo,
        c.nombre,
        c.finalizado,
        -- Setup actual del carro (el más reciente marcado como actual)
        cs.setup_id,
        cs.fecha_instalacion,
        -- Categoría 1: Unidad de Potencia
        cat1_pieza.part_id AS id_potencia,
        cat1_pieza_info.nombre AS nombre_potencia,
        cat1_pieza_info.p AS p_potencia,
        cat1_pieza_info.a AS a_potencia,
        cat1_pieza_info.m AS m_potencia,
        -- Categoría 2: Paquete Aerodinámico
        cat2_pieza.part_id AS id_aerodinamica,
        cat2_pieza_info.nombre AS nombre_aerodinamica,
        cat2_pieza_info.p AS p_aerodinamica,
        cat2_pieza_info.a AS a_aerodinamica,
        cat2_pieza_info.m AS m_aerodinamica,
        -- Categoría 3: Neumáticos
        cat3_pieza.part_id AS id_neumaticos,
        cat3_pieza_info.nombre AS nombre_neumaticos,
        cat3_pieza_info.p AS p_neumaticos,
        cat3_pieza_info.a AS a_neumaticos,
        cat3_pieza_info.m AS m_neumaticos,
        -- Categoría 4: Suspensión
        cat4_pieza.part_id AS id_suspension,
        cat4_pieza_info.nombre AS nombre_suspension,
        cat4_pieza_info.p AS p_suspension,
        cat4_pieza_info.a AS a_suspension,
        cat4_pieza_info.m AS m_suspension,
        -- Categoría 5: Caja de Cambios
        cat5_pieza.part_id AS id_caja_cambios,
        cat5_pieza_info.nombre AS nombre_caja_cambios,
        cat5_pieza_info.p AS p_caja_cambios,
        cat5_pieza_info.a AS a_caja_cambios,
        cat5_pieza_info.m AS m_caja_cambios,
        -- Totales calculados
        ISNULL(cat1_pieza_info.p, 0) + ISNULL(cat2_pieza_info.p, 0) + ISNULL(cat3_pieza_info.p, 0) + 
        ISNULL(cat4_pieza_info.p, 0) + ISNULL(cat5_pieza_info.p, 0) AS total_potencia,
        ISNULL(cat1_pieza_info.a, 0) + ISNULL(cat2_pieza_info.a, 0) + ISNULL(cat3_pieza_info.a, 0) + 
        ISNULL(cat4_pieza_info.a, 0) + ISNULL(cat5_pieza_info.a, 0) AS total_aerodinamica,
        ISNULL(cat1_pieza_info.m, 0) + ISNULL(cat2_pieza_info.m, 0) + ISNULL(cat3_pieza_info.m, 0) + 
        ISNULL(cat4_pieza_info.m, 0) + ISNULL(cat5_pieza_info.m, 0) AS total_manejo
    FROM dbo.carro c
    -- Setup actual
    LEFT JOIN dbo.car_setup cs ON c.id_carro = cs.car_id AND cs.es_actual = 1
    -- Piezas de cada categoría (asumiendo IDs 1-5 para las categorías)
    LEFT JOIN dbo.car_setup_pieza cat1_pieza ON cs.setup_id = cat1_pieza.setup_id AND cat1_pieza.category_id = 1
    LEFT JOIN dbo.pieza cat1_pieza_info ON cat1_pieza.part_id = cat1_pieza_info.id_pieza
    LEFT JOIN dbo.car_setup_pieza cat2_pieza ON cs.setup_id = cat2_pieza.setup_id AND cat2_pieza.category_id = 2
    LEFT JOIN dbo.pieza cat2_pieza_info ON cat2_pieza.part_id = cat2_pieza_info.id_pieza
    LEFT JOIN dbo.car_setup_pieza cat3_pieza ON cs.setup_id = cat3_pieza.setup_id AND cat3_pieza.category_id = 3
    LEFT JOIN dbo.pieza cat3_pieza_info ON cat3_pieza.part_id = cat3_pieza_info.id_pieza
    LEFT JOIN dbo.car_setup_pieza cat4_pieza ON cs.setup_id = cat4_pieza.setup_id AND cat4_pieza.category_id = 4
    LEFT JOIN dbo.pieza cat4_pieza_info ON cat4_pieza.part_id = cat4_pieza_info.id_pieza
    LEFT JOIN dbo.car_setup_pieza cat5_pieza ON cs.setup_id = cat5_pieza.setup_id AND cat5_pieza.category_id = 5
    LEFT JOIN dbo.pieza cat5_pieza_info ON cat5_pieza.part_id = cat5_pieza_info.id_pieza
    WHERE c.id_equipo = @id_equipo
    ORDER BY c.id_carro;
END;
GO