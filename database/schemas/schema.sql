--F1 Garage Manager - Schema inicial (SQL Server)
USE f1_garage_tec;
GO

--  DROP (para re-ejecutar)
IF OBJECT_ID('dbo.resultado_simulacion', 'U') IS NOT NULL DROP TABLE dbo.resultado_simulacion;
IF OBJECT_ID('dbo.car_setup_pieza', 'U') IS NOT NULL DROP TABLE dbo.car_setup_pieza;
IF OBJECT_ID('dbo.car_setup', 'U') IS NOT NULL DROP TABLE dbo.car_setup;
IF OBJECT_ID('dbo.part_stock', 'U') IS NOT NULL DROP TABLE dbo.part_stock;
IF OBJECT_ID('dbo.inventario_equipo', 'U') IS NOT NULL DROP TABLE dbo.inventario_equipo;

IF OBJECT_ID('dbo.simulacion', 'U') IS NOT NULL DROP TABLE dbo.simulacion;
IF OBJECT_ID('dbo.circuito', 'U') IS NOT NULL DROP TABLE dbo.circuito;

IF OBJECT_ID('dbo.conductor', 'U') IS NOT NULL DROP TABLE dbo.conductor;
IF OBJECT_ID('dbo.aporte', 'U') IS NOT NULL DROP TABLE dbo.aporte;
IF OBJECT_ID('dbo.patrocinador', 'U') IS NOT NULL DROP TABLE dbo.patrocinador;

IF OBJECT_ID('dbo.sesion', 'U') IS NOT NULL DROP TABLE dbo.sesion;
IF OBJECT_ID('dbo.usuario', 'U') IS NOT NULL DROP TABLE dbo.usuario;
IF OBJECT_ID('dbo.carro', 'U') IS NOT NULL DROP TABLE dbo.carro;
IF OBJECT_ID('dbo.pieza', 'U') IS NOT NULL DROP TABLE dbo.pieza;
IF OBJECT_ID('dbo.part_category', 'U') IS NOT NULL DROP TABLE dbo.part_category;
IF OBJECT_ID('dbo.equipo', 'U') IS NOT NULL DROP TABLE dbo.equipo;
IF OBJECT_ID('dbo.compra_equipo' , 'U') IS NOT NULL DROP TABLE dbo.compra_equipo;
GO

/* =========================
   Tablas base
   ========================= */

CREATE TABLE dbo.equipo (
    id_equipo        INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    CONSTRAINT pk_equipo PRIMARY KEY (id_equipo),
    CONSTRAINT uq_equipo_nombre UNIQUE (nombre)
);
GO

SET IDENTITY_INSERT dbo.equipo ON;
INSERT INTO dbo.equipo (id_equipo, nombre) 
VALUES (0, 'SIN EQUIPO / PENDIENTE');
SET IDENTITY_INSERT dbo.equipo OFF;

CREATE TABLE dbo.usuario (
    id_usuario       INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    email            NVARCHAR(200) NOT NULL,
    password_hash    NVARCHAR(255) NOT NULL,
    rol              NVARCHAR(20)  NOT NULL,  -- Admin | Engineer | Driver
    activo           BIT NOT NULL CONSTRAINT df_usuario_activo DEFAULT (1),
    id_equipo        INT NULL, -- "si aplica" (Engineer casi siempre tendrá equipo)
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_rol CHECK (rol IN ('Admin', 'Engineer', 'Driver')),
    CONSTRAINT fk_usuario_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
    -- Si es Engineer, debe tener equipo asignado (deja Admin/Driver opcional)
    CONSTRAINT ck_usuario_engineer_equipo CHECK ((rol <> 'Engineer') OR (id_equipo IS NOT NULL))
);
GO

CREATE TABLE dbo.sesion (
    id_sesion        NVARCHAR(450) NOT NULL, 
    id_usuario       INT NOT NULL,
    expira           DATETIME2 NOT NULL,
    datos_sesion     NVARCHAR(MAX) CONSTRAINT ck_sesion_json CHECK (ISJSON(datos_sesion) = 1), 
    creado_en        DATETIME2 NOT NULL CONSTRAINT df_sesion_creado DEFAULT (SYSUTCDATETIME()),
    
    CONSTRAINT pk_sesion PRIMARY KEY (id_sesion),
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario) REFERENCES dbo.usuario(id_usuario) ON DELETE CASCADE
);
GO

CREATE INDEX idx_sesion_expira ON dbo.sesion(expira);
GO

CREATE TABLE dbo.patrocinador (
    id_patrocinador  INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    email            NVARCHAR(200) NULL,
    CONSTRAINT pk_patrocinador PRIMARY KEY (id_patrocinador),
    CONSTRAINT uq_patrocinador_email UNIQUE (email)
);
GO

CREATE TABLE dbo.aporte (
    id_aporte        INT IDENTITY(1,1) NOT NULL,
    id_patrocinador  INT NOT NULL,
    id_equipo        INT NOT NULL,
    fecha            DATE NOT NULL,
    monto            DECIMAL(12,2) NOT NULL,
    descripcion      NVARCHAR(300) NULL,
    CONSTRAINT pk_aporte PRIMARY KEY (id_aporte),
    CONSTRAINT fk_aporte_patrocinador FOREIGN KEY (id_patrocinador) REFERENCES dbo.patrocinador(id_patrocinador),
    CONSTRAINT fk_aporte_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
    CONSTRAINT ck_aporte_monto CHECK (monto >= 0)
);
GO

CREATE TABLE dbo.conductor (
    id_conductor INT IDENTITY(1,1) NOT NULL,
    id_usuario   INT NULL,           
    id_equipo    INT NOT NULL DEFAULT 0,
    nombre       NVARCHAR(120) NOT NULL,
    habilidad_h  INT NOT NULL DEFAULT 50,
    CONSTRAINT pk_conductor PRIMARY KEY (id_conductor),
    CONSTRAINT fk_conductor_usuario FOREIGN KEY (id_usuario) REFERENCES dbo.usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_conductor_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
    CONSTRAINT ck_conductor_habilidad CHECK (habilidad_h BETWEEN 0 AND 100)
);
GO

/* =========================
   Partes / tienda
   ========================= */

CREATE TABLE dbo.part_category (
    category_id      INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(80) NOT NULL,
    CONSTRAINT pk_part_category PRIMARY KEY (category_id),
    CONSTRAINT uq_part_category_nombre UNIQUE (nombre)
);
GO

CREATE TABLE dbo.pieza (
    id_pieza         INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    precio           DECIMAL(12,2) NOT NULL,
    p                TINYINT NOT NULL,
    a                TINYINT NOT NULL,
    m                TINYINT NOT NULL,
    categoria_id     INT NOT NULL,
    CONSTRAINT pk_pieza PRIMARY KEY (id_pieza),
    CONSTRAINT fk_pieza_categoria FOREIGN KEY (categoria_id) REFERENCES dbo.part_category(category_id),
    CONSTRAINT ck_pieza_precio CHECK (precio >= 0),
    CONSTRAINT ck_pieza_p CHECK (p BETWEEN 0 AND 9),
    CONSTRAINT ck_pieza_a CHECK (a BETWEEN 0 AND 9),
    CONSTRAINT ck_pieza_m CHECK (m BETWEEN 0 AND 9),
    -- Para poder hacer FK compuesta desde la tabla intermedia y asegurar coherencia part<->category
    CONSTRAINT uq_pieza_id_categoria UNIQUE (id_pieza, categoria_id)
);
GO

CREATE TABLE dbo.part_stock (
    part_id          INT NOT NULL, -- 1:1 con Pieza
    stock_disponible INT NOT NULL CONSTRAINT df_part_stock_stock DEFAULT (0),
    last_update      DATETIME2 NOT NULL CONSTRAINT df_part_stock_last_update DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT pk_part_stock PRIMARY KEY (part_id),
    CONSTRAINT fk_part_stock_pieza FOREIGN KEY (part_id) REFERENCES dbo.pieza(id_pieza),
    CONSTRAINT ck_part_stock_nonneg CHECK (stock_disponible >= 0)
);
GO

/* =========================
   Inventario por equipo (necesario para compras/armado)
   ========================= */

CREATE TABLE dbo.inventario_equipo (
    id_equipo        INT NOT NULL,
    id_pieza         INT NOT NULL,
    cantidad         INT NOT NULL CONSTRAINT df_inventario_cantidad DEFAULT (0),
    last_update      DATETIME2 NOT NULL CONSTRAINT df_inventario_last_update DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT pk_inventario_equipo PRIMARY KEY (id_equipo, id_pieza),
    CONSTRAINT fk_inventario_equipo_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
    CONSTRAINT fk_inventario_equipo_pieza  FOREIGN KEY (id_pieza)  REFERENCES dbo.pieza(id_pieza),
    CONSTRAINT ck_inventario_cantidad CHECK (cantidad >= 0)
);
GO

/* =========================
   Carros y setups
   ========================= */

CREATE TABLE dbo.carro (
    id_carro         INT IDENTITY(1,1) NOT NULL,
    id_equipo        INT NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    finalizado       BIT NOT NULL CONSTRAINT df_carro_finalizado DEFAULT (0),
    CONSTRAINT pk_carro PRIMARY KEY (id_carro),
    CONSTRAINT fk_carro_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo)
    -- Regla "máximo 2 carros por equipo" -> se valida por Stored Procedure
);
GO

CREATE TABLE dbo.car_setup (
    setup_id         INT IDENTITY(1,1) NOT NULL,
    car_id           INT NOT NULL,
    id_conductor     INT NULL,
    fecha_instalacion DATETIME2 NOT NULL CONSTRAINT df_car_setup_fecha DEFAULT (SYSUTCDATETIME()),
    es_actual        BIT NOT NULL CONSTRAINT df_car_setup_actual DEFAULT (0),
    CONSTRAINT pk_car_setup PRIMARY KEY (setup_id),
    CONSTRAINT fk_car_setup_carro FOREIGN KEY (car_id) REFERENCES dbo.carro(id_carro),
    CONSTRAINT fk_car_setup_conductor FOREIGN KEY (id_conductor) REFERENCES dbo.conductor(id_conductor)
);
GO

/* =========================================================
   Tabla intermedia N:M (CarSetup <-> Pieza)
   - PK compuesta
   - Garantiza 1 pieza por categoría dentro de un setup:
       PRIMARY KEY (setup_id, category_id)
   - Garantiza coherencia pieza<->categoría con FK compuesta
   ========================================================= */

CREATE TABLE dbo.car_setup_pieza (
    setup_id         INT NOT NULL,
    category_id      INT NOT NULL,
    part_id          INT NOT NULL,
    CONSTRAINT pk_car_setup_pieza PRIMARY KEY (setup_id, category_id),
    CONSTRAINT fk_csp_setup FOREIGN KEY (setup_id) REFERENCES dbo.car_setup(setup_id),
    CONSTRAINT fk_csp_category FOREIGN KEY (category_id) REFERENCES dbo.part_category(category_id),
    -- FK compuesta asegura que el part_id realmente pertenece a ese category_id
    CONSTRAINT fk_csp_pieza_categoria FOREIGN KEY (part_id, category_id) REFERENCES dbo.pieza(id_pieza, categoria_id)
);
GO

/* =========================
   Circuitos y simulación
   ========================= */

CREATE TABLE dbo.circuito (
    id_circuito      INT IDENTITY(1,1) NOT NULL,
    nombre           NVARCHAR(120) NOT NULL,
    distancia_d      DECIMAL(10,3) NOT NULL, -- km
    curvas_c         INT NOT NULL,
    CONSTRAINT pk_circuito PRIMARY KEY (id_circuito),
    CONSTRAINT uq_circuito_nombre UNIQUE (nombre),
    CONSTRAINT ck_circuito_distancia CHECK (distancia_d > 0),
    CONSTRAINT ck_circuito_curvas CHECK (curvas_c >= 0)
);
GO

CREATE TABLE dbo.simulacion (
    id_simulacion    INT IDENTITY(1,1) NOT NULL,
    id_circuito      INT NOT NULL,
    fecha_hora       DATETIME2 NOT NULL CONSTRAINT df_simulacion_fecha DEFAULT (SYSUTCDATETIME()),
    id_usuario       INT NULL, -- quién ejecuta (Admin). Puede ser NULL si no aplica aún.
    CONSTRAINT pk_simulacion PRIMARY KEY (id_simulacion),
    CONSTRAINT fk_simulacion_circuito FOREIGN KEY (id_circuito) REFERENCES dbo.circuito(id_circuito),
    CONSTRAINT fk_simulacion_usuario  FOREIGN KEY (id_usuario)  REFERENCES dbo.usuario(id_usuario)
);
GO

CREATE TABLE dbo.resultado_simulacion (
    id_resultado     INT IDENTITY(1,1) NOT NULL,
    id_simulacion    INT NOT NULL,
    id_carro         INT NOT NULL,
    setup_id         INT NOT NULL,
    posicion         INT NOT NULL,
    vrecta           DECIMAL(10,3) NOT NULL,
    vcurva           DECIMAL(10,3) NOT NULL,
    penalizacion     DECIMAL(12,3) NOT NULL,
    tiempo_segundos  DECIMAL(12,3) NOT NULL,
    CONSTRAINT pk_resultado_simulacion PRIMARY KEY (id_resultado),
    CONSTRAINT fk_resultado_simulacion_simulacion FOREIGN KEY (id_simulacion) REFERENCES dbo.simulacion(id_simulacion),
    CONSTRAINT fk_resultado_simulacion_carro      FOREIGN KEY (id_carro)      REFERENCES dbo.carro(id_carro),
    CONSTRAINT fk_resultado_simulacion_setup      FOREIGN KEY (setup_id)      REFERENCES dbo.car_setup(setup_id),
    CONSTRAINT uq_resultado_simulacion_unico UNIQUE (id_simulacion, id_carro),
    CONSTRAINT ck_resultado_posicion CHECK (posicion > 0),
    CONSTRAINT ck_resultado_tiempo CHECK (tiempo_segundos >= 0)
);

/* =========================
   historial de compras (AUDITORÍA)
   ========================= */

CREATE TABLE dbo.compra_equipo (
    id_compra       INT IDENTITY(1,1) NOT NULL,
    id_equipo       INT NOT NULL,
    id_pieza        INT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unit     DECIMAL(12,2) NOT NULL,
    total           DECIMAL(12,2) NOT NULL,
    fecha_compra    DATETIME2 NOT NULL CONSTRAINT df_compra_fecha DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT pk_compra_equipo PRIMARY KEY (id_compra),
    CONSTRAINT fk_compra_equipo_equipo FOREIGN KEY (id_equipo) REFERENCES dbo.equipo(id_equipo),
    CONSTRAINT fk_compra_equipo_pieza  FOREIGN KEY (id_pieza)  REFERENCES dbo.pieza(id_pieza),
    CONSTRAINT ck_compra_cantidad CHECK (cantidad > 0),
    CONSTRAINT ck_compra_total CHECK (total >= 0)
);
GO