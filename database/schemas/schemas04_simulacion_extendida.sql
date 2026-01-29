USE f1_garage_tec;
GO

/* =========================================================
   EXTENSIÓN DE SIMULACIÓN
   - Snapshot inmutable del setup por simulación
   - Totales explícitos para análisis y Grafana
   ========================================================= */

/* =========================================================
   1. Snapshot del setup usado en cada simulación
   ========================================================= */

IF OBJECT_ID('dbo.simulacion_setup_pieza', 'U') IS NOT NULL
    DROP TABLE dbo.simulacion_setup_pieza;
GO

CREATE TABLE dbo.simulacion_setup_pieza (
    id_simulacion INT NOT NULL,
    id_carro      INT NOT NULL,
    category_id   INT NOT NULL,
    part_id       INT NOT NULL,
    p             TINYINT NOT NULL,
    a             TINYINT NOT NULL,
    m             TINYINT NOT NULL,

    CONSTRAINT pk_simulacion_setup_pieza 
        PRIMARY KEY (id_simulacion, id_carro, category_id),

    CONSTRAINT fk_ssp_simulacion 
        FOREIGN KEY (id_simulacion) 
        REFERENCES dbo.simulacion(id_simulacion)
        ON DELETE CASCADE,

    CONSTRAINT fk_ssp_carro 
        FOREIGN KEY (id_carro) 
        REFERENCES dbo.carro(id_carro),

    CONSTRAINT fk_ssp_categoria 
        FOREIGN KEY (category_id) 
        REFERENCES dbo.part_category(category_id),

    CONSTRAINT fk_ssp_pieza 
        FOREIGN KEY (part_id) 
        REFERENCES dbo.pieza(id_pieza),

    CONSTRAINT ck_ssp_p CHECK (p BETWEEN 0 AND 9),
    CONSTRAINT ck_ssp_a CHECK (a BETWEEN 0 AND 9),
    CONSTRAINT ck_ssp_m CHECK (m BETWEEN 0 AND 9)
);
GO

/* Índices útiles para Grafana */
CREATE INDEX idx_ssp_simulacion 
ON dbo.simulacion_setup_pieza(id_simulacion);

CREATE INDEX idx_ssp_carro 
ON dbo.simulacion_setup_pieza(id_carro);
GO

/* =========================================================
   2. Refuerzo de resultado_simulacion con totales explícitos
   ========================================================= */

IF COL_LENGTH('dbo.resultado_simulacion', 'p_total') IS NULL
BEGIN
    ALTER TABLE dbo.resultado_simulacion
    ADD
        p_total INT NOT NULL,
        a_total INT NOT NULL,
        m_total INT NOT NULL,
        h_conductor INT NOT NULL;
END
GO

/* Checks adicionales */
ALTER TABLE dbo.resultado_simulacion
ADD CONSTRAINT ck_resultado_p_total CHECK (p_total >= 0),
    CONSTRAINT ck_resultado_a_total CHECK (a_total >= 0),
    CONSTRAINT ck_resultado_m_total CHECK (m_total >= 0),
    CONSTRAINT ck_resultado_h_conductor CHECK (h_conductor BETWEEN 0 AND 100);
GO

/* =========================================================
   3. Índices para análisis y rankings
   ========================================================= */

CREATE INDEX idx_resultado_simulacion_simulacion
ON dbo.resultado_simulacion(id_simulacion);

CREATE INDEX idx_resultado_simulacion_tiempo
ON dbo.resultado_simulacion(tiempo_segundos);

CREATE INDEX idx_resultado_simulacion_carro
ON dbo.resultado_simulacion(id_carro);
GO
